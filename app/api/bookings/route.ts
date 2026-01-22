import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMS, formatPhoneNumber } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    const { name, phone, service, date, time } = await req.json();
    
    // Validate inputs
    if (!name || !phone || !service || !date || !time) {
        return NextResponse.json(
             { error: 'Missing required fields' }, 
             { status: 400 }
        );
    }

    // Format phone number before DB operations
    const formattedPhone = formatPhoneNumber(String(phone));

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
      // Create new user with phone
      // Note: Ensure email uses 'DEFAULT' or we explicitly insert NULL if the column allows it
      // but we removed email from the form.
       const newUser = await db.query(
        `INSERT INTO users (name, phone, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [name, formattedPhone, 'guest_booking_placeholder'] 
      );
      userId = newUser.rows[0].id;
    }
    
    // 2. Create Appointment
    await db.query(
      `INSERT INTO appointments (user_id, service_type, appointment_date, status)
       VALUES ($1, $2, $3, 'pending')`,
       [userId, service, appointmentDate]
    );

    // 3. Send SMS
    const message = `Hello ${name}, your booking for ${service} on ${date} at ${time} is received. We will confirm shortly. - Vitapharm`;
    await sendSMS(formattedPhone, message);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Booking error:', error);
    // Return detailed error for debugging (remove in production)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
