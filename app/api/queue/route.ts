import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');

    // If provider_id given, return only queue entries assigned to this doctor
    if (providerId) {
      try {
        const result = await db.query(`
          SELECT q.id, q.ticket_number, q.status, q.created_at, q.provider_id, u.name as client_name, u.phone, u.id as user_id
          FROM queue q
          JOIN users u ON q.user_id = u.id
          WHERE (q.status = $1 OR q.status = $2) AND q.provider_id = $3
          ORDER BY q.created_at ASC
        `, ['waiting', 'in_consultation', providerId]);
        return NextResponse.json(result.rows);
      } catch (colErr: unknown) {
        // Schema not migrated yet (e.g. provider_id column missing): return all waiting
        const msg = colErr instanceof Error ? colErr.message : String(colErr);
        if (msg.includes('provider_id') || msg.includes('column')) {
          const fallback = await db.query(`
            SELECT q.id, q.ticket_number, q.created_at, u.name as client_name, u.phone, u.id as user_id
            FROM queue q
            JOIN users u ON q.user_id = u.id
            WHERE q.status = $1
            ORDER BY q.created_at ASC
          `, ['waiting']);
          return NextResponse.json(fallback.rows);
        }
        throw colErr;
      }
    }

    // No provider_id: return all waiting (for reception or backward compat)
    try {
      const result = await db.query(`
        SELECT q.id, q.ticket_number, q.status, q.created_at, q.provider_id, u.name as client_name, u.phone, u.id as user_id
        FROM queue q
        JOIN users u ON q.user_id = u.id
        WHERE q.status = $1
        ORDER BY q.created_at ASC
      `, ['waiting']);
      return NextResponse.json(result.rows);
    } catch (colErr: unknown) {
      const msg = colErr instanceof Error ? colErr.message : String(colErr);
      if (msg.includes('provider_id') || msg.includes('column')) {
        const fallback = await db.query(`
          SELECT q.id, q.ticket_number, q.created_at, u.name as client_name, u.phone, u.id as user_id
          FROM queue q
          JOIN users u ON q.user_id = u.id
          WHERE q.status = $1
          ORDER BY q.created_at ASC
        `, ['waiting']);
        return NextResponse.json(fallback.rows);
      }
      throw colErr;
    }
  } catch (err) {
    console.error('Queue fetch error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
