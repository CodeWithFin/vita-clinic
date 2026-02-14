import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/providers/[id]/availability - Weekly availability for a provider.
 * Returns { day_of_week, start_time, end_time }[] (day 1=Mon .. 7=Sun).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id, 10);
    if (Number.isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider id' }, { status: 400 });
    }
    const result = await db.query(
      `SELECT id, day_of_week, start_time, end_time FROM provider_availability
       WHERE provider_id = $1 ORDER BY day_of_week`,
      [providerId]
    ).catch(() => ({ rows: [] }));
    return NextResponse.json(result.rows ?? []);
  } catch (err) {
    console.error('Availability get error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/providers/[id]/availability - Set weekly availability.
 * Body: { slots: { day_of_week: number, start_time: string "HH:mm", end_time: string }[] }
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id, 10);
    if (Number.isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider id' }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const slots = body.slots ?? [];
    await db.query('DELETE FROM provider_availability WHERE provider_id = $1', [providerId]);
    for (const s of slots) {
      const day = Number(s.day_of_week);
      if (day < 1 || day > 7 || !s.start_time || !s.end_time) continue;
      await db.query(
        `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [providerId, day, s.start_time, s.end_time]
      );
    }
    const result = await db.query(
      'SELECT id, day_of_week, start_time, end_time FROM provider_availability WHERE provider_id = $1 ORDER BY day_of_week',
      [providerId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Availability put error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
