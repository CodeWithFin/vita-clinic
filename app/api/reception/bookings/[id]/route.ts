import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMSWithRetry, logSMSResult } from '@/lib/sms';

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
    const newStatus = (updatedBooking.status || '').toLowerCase();

    // Send status-update SMS when status is confirmed or cancelled (with retry and log)
    if (newStatus === 'confirmed' || newStatus === 'cancelled') {
      try {
        let phone: string | null = null;
        let name: string | null = null;
        let clientId: number | null = null;
        let userId: number | null = null;
        if (updatedBooking.client_id) {
          let clientRes: { rows: { name: string; phone: string | null; sms_opt_in?: boolean }[] };
          try {
            clientRes = await db.query('SELECT name, phone, sms_opt_in FROM clients WHERE id = $1', [updatedBooking.client_id]);
          } catch (e) {
            const msg = (e as Error)?.message ?? String(e);
            if (msg.includes('sms_opt_in') || msg.includes('column') || msg.includes('does not exist')) {
              clientRes = await db.query('SELECT name, phone FROM clients WHERE id = $1', [updatedBooking.client_id]);
            } else throw e;
          }
          if (clientRes.rows[0] && clientRes.rows[0].sms_opt_in !== false) {
            name = clientRes.rows[0].name;
            phone = clientRes.rows[0].phone;
            clientId = updatedBooking.client_id;
          }
        }
        if ((!phone || !name) && updatedBooking.user_id) {
          const userRes = await db.query('SELECT name, phone FROM users WHERE id = $1', [updatedBooking.user_id]);
          if (userRes.rows[0]) {
            name = name || userRes.rows[0].name;
            phone = phone || userRes.rows[0].phone;
            userId = updatedBooking.user_id;
          }
        }
        if (phone && name) {
          const serviceLabel = updatedBooking.service_type || 'your appointment';
          const dateStr = updatedBooking.appointment_date
            ? new Date(updatedBooking.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
          const timeStr = updatedBooking.appointment_date
            ? new Date(updatedBooking.appointment_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            : '';
          const smsMessage =
            newStatus === 'cancelled'
              ? `Hi ${name}, your appointment (${serviceLabel}) has been cancelled.${updatedBooking.cancellation_reason ? ` Reason: ${updatedBooking.cancellation_reason}` : ''} - Vitapharm`
              : `Hi ${name}, your appointment for ${serviceLabel} on ${dateStr} at ${timeStr} is confirmed. - Vitapharm`;
          const smsResult = await sendSMSWithRetry(phone, smsMessage);
          await logSMSResult({
            client_id: clientId,
            user_id: userId,
            phone,
            message: smsMessage,
            template_slug: newStatus === 'cancelled' ? 'appointment_cancelled' : 'appointment_confirmation',
            appointment_id: updatedBooking.id,
            result: smsResult,
          });
          if (!smsResult.sent) {
            console.warn('Status update SMS not sent:', smsResult.reason);
          }
        }
      } catch (smsError) {
        console.error('Failed to send status update SMS', smsError);
      }
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
