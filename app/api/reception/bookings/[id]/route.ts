import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, cancellation_reason } = body;

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

    const updates: string[] = ['status = $1'];
    const values: (string | null)[] = [status.toLowerCase()];
    let idx = 2;
    if (status.toLowerCase() === 'cancelled' && body.hasOwnProperty('cancellation_reason')) {
      updates.push(`cancellation_reason = $${idx}`);
      values.push(typeof cancellation_reason === 'string' ? cancellation_reason : null);
      idx++;
    }
    values.push(id);
    const result = await db.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
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
