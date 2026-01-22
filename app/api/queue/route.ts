import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.query('SELECT * FROM queue WHERE status = $1 ORDER BY created_at ASC', ['waiting']);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Queue fetch error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
