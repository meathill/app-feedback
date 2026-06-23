import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import type { FeedbackStatus } from '@/types';

const VALID_STATUSES: FeedbackStatus[] = ['pending', 'processed', 'archived', 'deleted'];
const MAX_BATCH_SIZE = 100;

interface BatchPatchBody {
  ids?: unknown;
  status?: unknown;
}

function normalizeIds(ids: unknown): number[] | null {
  if (!Array.isArray(ids) || ids.length === 0) return null;

  const uniqueIds = new Set<number>();
  for (const id of ids) {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return null;
    uniqueIds.add(id);
  }

  return [...uniqueIds];
}

export async function PATCH(request: Request) {
  const { env } = await getCloudflareContext();

  try {
    const body = (await request.json()) as BatchPatchBody;
    const ids = normalizeIds(body.ids);

    if (!ids) {
      return NextResponse.json({ error: 'ids must be a non-empty array of positive integers' }, { status: 400 });
    }

    if (ids.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `ids cannot contain more than ${MAX_BATCH_SIZE} items` }, { status: 400 });
    }

    if (typeof body.status !== 'string' || !VALID_STATUSES.includes(body.status as FeedbackStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const placeholders = ids.map(() => '?').join(', ');
    const result = await env.DB.prepare(`UPDATE feedbacks SET status = ? WHERE id IN (${placeholders})`)
      .bind(body.status, ...ids)
      .run();

    return NextResponse.json({ success: true, updated: result.meta.changes ?? 0 });
  } catch (error) {
    console.error('Error batch updating feedbacks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
