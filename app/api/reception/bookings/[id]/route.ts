import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
        return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
        );
    }

    const result = await db.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status.toLowerCase(), id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const updatedBooking = result.rows[0];

    // SMS notification removed as per request
    /*
    try {
        const userRes = await db.query('SELECT name, phone FROM users WHERE id = $1', [updatedBooking.user_id]);
        // ... SMS logic removed ...
    } catch (smsError) {
        console.error("Failed to send status update SMS", smsError);
    }
    */

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
