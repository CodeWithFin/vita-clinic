import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTotalDurationMinutes } from '@/lib/service-durations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/providers/available-slots?date=YYYY-MM-DD&provider_id=1&duration=60
 * Returns array of available start times (HH:mm) for the given date and provider.
 * Checks provider_availability (day of week) and existing appointments for conflicts.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const providerId = searchParams.get('provider_id');
    const duration = parseInt(searchParams.get('duration') ?? '60', 10);

    if (!dateStr || !providerId) {
      return NextResponse.json(
        { error: 'date and provider_id required' },
        { status: 400 }
      );
    }
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    const pid = parseInt(providerId, 10);
    if (Number.isNaN(pid)) {
      return NextResponse.json({ error: 'Invalid provider_id' }, { status: 400 });
    }

    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    let startTime = '09:00';
    let endTime = '17:00';
    try {
      const av = await db.query(
        'SELECT start_time, end_time FROM provider_availability WHERE provider_id = $1 AND day_of_week = $2',
        [pid, dayOfWeek]
      );
      if (av.rows.length > 0) {
        startTime = av.rows[0].start_time?.toString().slice(0, 5) ?? startTime;
        endTime = av.rows[0].end_time?.toString().slice(0, 5) ?? endTime;
      }
    } catch {
      // No table or no row: use defaults
    }

    const override = await db.query(
      'SELECT start_time, end_time, is_available FROM provider_availability_overrides WHERE provider_id = $1 AND override_date = $2',
      [pid, dateStr]
    ).catch(() => ({ rows: [] }));
    if (override.rows?.length > 0) {
      if (!override.rows[0].is_available) {
        return NextResponse.json([]);
      }
      if (override.rows[0].start_time) startTime = override.rows[0].start_time.toString().slice(0, 5);
      if (override.rows[0].end_time) endTime = override.rows[0].end_time.toString().slice(0, 5);
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const existing = await db.query(
      `SELECT a.appointment_date, COALESCE(a.duration_minutes, 60) as duration_minutes
       FROM appointments a
       WHERE a.provider_id = $1 AND a.status NOT IN ('cancelled')
         AND (a.appointment_date::date) = $2::date`,
      [pid, dateStr]
    ).catch(() => ({ rows: [] }));

    const bookedRanges: [number, number][] = (existing.rows ?? []).map((r: { appointment_date: string; duration_minutes: number }) => {
      const d = new Date(r.appointment_date);
      const s = d.getHours() * 60 + d.getMinutes();
      const dur = Number(r.duration_minutes) || 60;
      return [s, s + dur] as [number, number];
    });

    const slotInterval = 15;
    const slots: string[] = [];
    for (let t = startMinutes; t + duration <= endMinutes; t += slotInterval) {
      const conflict = bookedRanges.some(([s, e]) => !(t + duration <= s || e <= t));
      if (!conflict) {
        const h = Math.floor(t / 60);
        const m = t % 60;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return NextResponse.json(slots);
  } catch (err) {
    console.error('Available slots error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
