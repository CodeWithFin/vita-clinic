import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST: Assign the next waiting patient (no provider) to this doctor.
 * Body: { provider_id: number }
 * Returns the assigned queue entry or 404 if no one waiting.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providerId = body?.provider_id;
    if (providerId == null) {
      return NextResponse.json(
        { message: 'provider_id required' },
        { status: 400 }
      );
    }

    // Pick oldest waiting entry with no provider assigned
    const select = await db.query(
      `SELECT id FROM queue
       WHERE status = $1 AND provider_id IS NULL
       ORDER BY created_at ASC
       LIMIT 1`,
      ['waiting']
    );

    if (select.rows.length === 0) {
      return NextResponse.json(
        { message: 'No patients waiting' },
        { status: 404 }
      );
    }

    const queueId = select.rows[0].id;
    await db.query(
      `UPDATE queue SET provider_id = $1, status = $2 WHERE id = $3`,
      [providerId, 'in_consultation', queueId]
    );

    const result = await db.query(
      `SELECT q.id, q.ticket_number, q.status, q.created_at, q.provider_id, u.name as client_name, u.phone, u.id as user_id
       FROM queue q
       JOIN users u ON q.user_id = u.id
       WHERE q.id = $1`,
      [queueId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Call next error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
