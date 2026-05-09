import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { translateToEnglish } from '@/lib/gemini';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feedbackId = parseInt(id);
  if (isNaN(feedbackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { env } = await getCloudflareContext();

  if (!env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const row = await env.DB.prepare('SELECT content FROM feedbacks WHERE id = ? AND status != ?')
      .bind(feedbackId, 'deleted')
      .first<{ content: string }>();

    if (!row) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const contentEn = await translateToEnglish(row.content, env.GEMINI_API_KEY);

    await env.DB.prepare('UPDATE feedbacks SET content_en = ? WHERE id = ?').bind(contentEn, feedbackId).run();

    return NextResponse.json({ id: feedbackId, contentEn });
  } catch (error) {
    console.error('Error translating feedback:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}
