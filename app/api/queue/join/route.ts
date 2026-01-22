import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Ideally validation of userId vs authenticated user should happen here.
    if (!userId) {
       return NextResponse.json(
        { message: 'User ID required' },
        { status: 400 }
      );
    }

    const ticketNumber = 'A-' + Math.floor(Math.random() * 1000);

    const result = await db.query(
      'INSERT INTO queue (user_id, ticket_number, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, ticketNumber, 'waiting']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Queue join error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
