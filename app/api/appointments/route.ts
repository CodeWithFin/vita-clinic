import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/appointments?date=YYYY-MM-DD
 * Optional: provider_id (for future filtering; currently returns all for date.)
 * Returns all appointments for the given date (default today) so doctors see every patient booked.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    const date = dateStr || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const result = await db.query(
      `SELECT a.id, a.user_id, a.service_type, a.appointment_date, a.status, a.provider_id,
              u.name as client_name, u.phone
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.appointment_date::date = $1::date
         AND a.status != 'cancelled'
       ORDER BY a.appointment_date ASC`,
      [date]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Appointments fetch error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
