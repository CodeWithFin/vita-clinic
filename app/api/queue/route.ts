import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query(`
      SELECT q.id, q.ticket_number, q.created_at, u.name as client_name, u.phone, u.id as user_id
      FROM queue q
      JOIN users u ON q.user_id = u.id
      WHERE q.status = $1 
      ORDER BY q.created_at ASC
    `, ['waiting']);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Queue fetch error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
