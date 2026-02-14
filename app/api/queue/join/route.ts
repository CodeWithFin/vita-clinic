import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, client_id: clientId } = body;

    if (clientId != null) {
      const cid = Number(clientId);
      if (!Number.isInteger(cid)) {
        return NextResponse.json({ message: 'Invalid client_id' }, { status: 400 });
      }
      const ticketNumber = 'A-' + Math.floor(Math.random() * 10000);
      try {
        const result = await db.query(
          `INSERT INTO queue (client_id, ticket_number, status) VALUES ($1, $2, $3) RETURNING *`,
          [cid, ticketNumber, 'waiting']
        );
        return NextResponse.json(result.rows[0], { status: 201 });
      } catch (colErr: unknown) {
        if (String(colErr).includes('client_id') || String(colErr).includes('column')) {
          return NextResponse.json(
            { message: 'Clients migration not applied. Run scripts/run-clients-migration.js' },
            { status: 503 }
          );
        }
        throw colErr;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID or client_id required' },
        { status: 400 }
      );
    }

    const ticketNumber = 'A-' + Math.floor(Math.random() * 10000);
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
