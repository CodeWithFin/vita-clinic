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

    // Send SMS notification for status changes
    try {
        const userRes = await db.query('SELECT name, phone FROM users WHERE id = $1', [updatedBooking.user_id]);
        if (userRes.rows.length > 0) {
            const { name, phone } = userRes.rows[0];
            const dateStr = new Date(updatedBooking.appointment_date).toLocaleDateString();
            const timeStr = new Date(updatedBooking.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            let message = '';
            if (status.toLowerCase() === 'confirmed') {
                message = `Hello ${name}, your booking for ${updatedBooking.service_type} on ${dateStr} at ${timeStr} has been CONFIRMED. Check in 10 mins early. - Vitapharm`;
            } else if (status.toLowerCase() === 'cancelled') {
                 message = `Hello ${name}, your booking for ${updatedBooking.service_type} on ${dateStr} has been CANCELLED. Please contact us for details. - Vitapharm`;
            } else if (status.toLowerCase() === 'completed') {
                 message = `Hello ${name}, thank you for visiting Vitapharm. We hope to see you again!`;
            }

            if (message) {
                await sendSMS(phone, message);
            }
        }
    } catch (smsError) {
        console.error("Failed to send status update SMS", smsError);
        // We generally don't want to fail the request if SMS fails, just log it
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
