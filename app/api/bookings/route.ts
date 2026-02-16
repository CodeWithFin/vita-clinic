import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS, formatPhoneNumber } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    let body: { name?: string; phone?: string; service?: string; date?: string; time?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { name, phone, service, date, time } = body;

    // Validate inputs
    if (!name || !phone || !service || !date || !time) {
        return NextResponse.json(
             { error: 'Missing required fields' }, 
             { status: 400 }
        );
    }

    // Format phone number before DB operations
    const formattedPhone = formatPhoneNumber(String(phone));
    if (!formattedPhone || formattedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Combine date and time to ISO string for TIMESTAMP
    const appointmentDate = new Date(`${date}T${time}:00`);
    if (isNaN(appointmentDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
    }
    
    // 1. Check or Create User via Phone
    const userCheck = await db.query(
      'SELECT id FROM users WHERE phone = $1',
      [formattedPhone]
    );

    let userId;

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      // Update the user's name with the latest provided name
      await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
    } else {
      // Create new user with phone (email left NULL)
      const newUser = await db.query(
        `INSERT INTO users (name, phone, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [name.trim(), formattedPhone, 'guest_booking_placeholder']
      );
      userId = newUser.rows[0].id;
    }

    // 2. Create Appointment (only columns that exist in base schema; migrations may add optional columns)
    await db.query(
      `INSERT INTO appointments (user_id, service_type, appointment_date, status)
       VALUES ($1, $2, $3, 'confirmed')`,
      [userId, String(service).trim(), appointmentDate]
    );

    // 3. Send SMS confirmation (booking still succeeds if SMS fails)
    const smsMessage = `Hello ${name}, your booking for ${service} on ${date} at ${time} is confirmed! We look forward to seeing you. - Vitapharm`;
    const smsResult = await sendSMS(formattedPhone, smsMessage);

    if (!smsResult.sent) {
      console.warn('Booking confirmed but SMS not sent:', smsResult.reason);
    }

    return NextResponse.json({
      success: true,
      smsSent: smsResult.sent,
      ...(smsResult.sent ? {} : { smsReason: smsResult.reason }),
    });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Booking error:', err.message, err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
