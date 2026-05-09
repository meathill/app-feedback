import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import type { Feedback, FeedbackSubmission } from '@/types';
import { PAGE_SIZE } from '@/constants';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || String(PAGE_SIZE)));
  const offset = (page - 1) * limit;
  const appId = searchParams.get('app_id') || null;
  const status = searchParams.get('status') || null;
  const tag = searchParams.get('tag') || null;

  try {
    // 构建动态查询
    const conditions: string[] = ["status != 'deleted'"];
    const params: (string | number)[] = [];

    if (appId) {
      conditions.push('app_id = ?');
      params.push(appId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (tag) {
      conditions.push('EXISTS (SELECT 1 FROM json_each(tags) WHERE json_each.value = ?)');
      params.push(tag);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM feedbacks ${where}`;
    const { results: countResults } = await env.DB.prepare(countSql)
      .bind(...params)
      .all<{ total: number }>();
    const total = countResults[0]?.total || 0;

    // 获取数据
    const dataSql = `SELECT id, app_id as appId, version, content, content_en as contentEn, contact, device_info as deviceInfo, location, status, notes, tags, created_at as createdAt FROM feedbacks ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const { results } = await env.DB.prepare(dataSql)
      .bind(...params, limit, offset)
      .all<Feedback & { tags: string }>();

    // 解析 tags JSON
    const feedbacks = results.map((f) => ({
      ...f,
      tags: typeof f.tags === 'string' ? JSON.parse(f.tags) : f.tags || [],
    }));

    // 获取所有应用列表
    const { results: appResults } = await env.DB.prepare('SELECT DISTINCT app_id FROM feedbacks ORDER BY app_id').all<{
      app_id: string;
    }>();
    const apps = appResults.map((r) => r.app_id);

    return NextResponse.json({
      data: feedbacks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      apps,
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();

  try {
    const body = (await request.json()) as FeedbackSubmission;
    const { appId, version, content, contact, deviceInfo, location, tags } = body;

    // Basic Validation
    if (!appId || !content) {
      return NextResponse.json({ error: 'Missing required fields: appId and content are required.' }, { status: 400 });
    }

    const normalizedTags = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string' && t.trim()) : [];
    const isUninstallSurvey = normalizedTags.includes('uninstall-survey');

    // Insert into D1
    const stmt = env.DB.prepare(
      `INSERT INTO feedbacks (app_id, version, content, contact, device_info, location, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );

    await stmt
      .bind(
        appId,
        version || null,
        content,
        contact || null,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        location ? JSON.stringify(location) : null,
        JSON.stringify(normalizedTags),
      )
      .run();

    // Send Telegram Notification (Fire and Forget)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const header = isUninstallSurvey ? 'Uninstall Survey Received!' : 'New Feedback Received!';
      const reasonTags = normalizedTags.filter((t) => t !== 'uninstall-survey');
      const reasonsLine = isUninstallSurvey && reasonTags.length ? `\nReasons: ${reasonTags.join(', ')}` : '';
      const message = `
${header}
App: ${appId} ${version ? `(${version})` : ''}
Contact: ${contact || 'N/A'}${reasonsLine}
Content:
${content}
      `.trim();

      const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

      // We don't await this to keep the response fast, or we can await if we want to ensure delivery logic logs errors
      /* await */ fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
        }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
