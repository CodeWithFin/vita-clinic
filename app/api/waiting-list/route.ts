import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/waiting-list - List waiting list entries (optional status= filter).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'waiting';
    const result = await db.query(
      `SELECT w.id, w.client_id, w.user_id, w.service_type, w.preferred_date_from, w.preferred_date_to,
              w.provider_id, w.status, w.notes, w.created_at,
              c.name as client_name, c.phone as client_phone
       FROM waiting_list w
       LEFT JOIN clients c ON w.client_id = c.id
       WHERE w.status = $1
       ORDER BY w.preferred_date_from ASC, w.created_at ASC`,
      [status]
    ).catch(() => ({ rows: [] }));
    return NextResponse.json(result.rows ?? []);
  } catch (err) {
    console.error('Waiting list get error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/waiting-list - Add to waiting list.
 * Body: { client_id?, user_id?, service_type, preferred_date_from, preferred_date_to?, provider_id?, notes? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      client_id,
      user_id,
      service_type,
      preferred_date_from,
      preferred_date_to,
      provider_id,
      notes,
    } = body;
    if (!service_type || !preferred_date_from) {
      return NextResponse.json(
        { error: 'service_type and preferred_date_from required' },
        { status: 400 }
      );
    }
    const result = await db.query(
      `INSERT INTO waiting_list (client_id, user_id, service_type, preferred_date_from, preferred_date_to, provider_id, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'waiting')
       RETURNING *`,
      [
        client_id ?? null,
        user_id ?? null,
        String(service_type).trim(),
        preferred_date_from,
        preferred_date_to ?? preferred_date_from,
        provider_id ?? null,
        notes ?? null,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Waiting list post error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
