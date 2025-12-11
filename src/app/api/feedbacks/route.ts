import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { FeedbackSubmission } from '@/types';

export async function POST(request: Request) {
  const { env } = getCloudflareContext();

  try {
    const body = (await request.json()) as FeedbackSubmission;
    const { appId, version, content, contact, deviceInfo, location } = body;

    // Basic Validation
    if (!appId || !content) {
      return NextResponse.json({ error: 'Missing required fields: appId and content are required.' }, { status: 400 });
    }

    // Insert into D1
    const stmt = env.DB.prepare(
      `INSERT INTO feedbacks (app_id, version, content, contact, device_info, location) VALUES (?, ?, ?, ?, ?, ?)`,
    );

    await stmt
      .bind(
        appId,
        version || null,
        content,
        contact || null,
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        location ? JSON.stringify(location) : null,
      )
      .run();

    // Send Telegram Notification (Fire and Forget)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const message = `
New Feedback Received!
App: ${appId} ${version ? `(${version})` : ''}
Contact: ${contact || 'N/A'}
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
