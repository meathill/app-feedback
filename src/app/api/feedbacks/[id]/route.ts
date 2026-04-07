import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import type { FeedbackStatus } from '@/types';

const VALID_STATUSES: FeedbackStatus[] = ['pending', 'processed', 'archived', 'deleted'];

interface PatchBody {
  status?: FeedbackStatus;
  notes?: string | null;
  tags?: string[];
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feedbackId = parseInt(id);
  if (isNaN(feedbackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { env } = await getCloudflareContext();

  try {
    const body = (await request.json()) as PatchBody;
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      updates.push('status = ?');
      values.push(body.status);
    }

    if (body.notes !== undefined) {
      updates.push('notes = ?');
      values.push(body.notes);
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
      }
      updates.push('tags = ?');
      values.push(JSON.stringify(body.tags));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(feedbackId);
    const sql = `UPDATE feedbacks SET ${updates.join(', ')} WHERE id = ?`;
    const result = await env.DB.prepare(sql)
      .bind(...values)
      .run();

    if (result.meta.changes === 0) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feedbackId = parseInt(id);
  if (isNaN(feedbackId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { env } = await getCloudflareContext();

  try {
    // 软删除
    const result = await env.DB.prepare("UPDATE feedbacks SET status = 'deleted' WHERE id = ? AND status != 'deleted'")
      .bind(feedbackId)
      .run();

    if (result.meta.changes === 0) {
      return NextResponse.json({ error: 'Feedback not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
