import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients/[id] - Single client with visit history and service history.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }

    const clientResult = await db.query(
      `SELECT * FROM clients WHERE id = $1`,
      [clientId]
    );
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    const client = clientResult.rows[0];

    // Visit history: appointments for this client (use client_id, fallback to user_id via legacy join not needed if we have client_id)
    const visitsResult = await db.query(
      `SELECT id, service_type, appointment_date, status, created_at
       FROM appointments
       WHERE client_id = $1
       ORDER BY appointment_date DESC
       LIMIT 100`,
      [clientId]
    );
    const visit_history = visitsResult.rows;

    // Service history: same as visit history for now (each appointment is a service); can add from patient_records later
    const service_history = visit_history.map((v: Record<string, unknown>) => ({
      date: v.appointment_date,
      service: v.service_type,
      status: v.status,
      appointment_id: v.id,
    }));

    return NextResponse.json({
      ...client,
      visit_count: client.visit_count ?? visit_history.length,
      visit_history,
      service_history,
    });
  } catch (err) {
    console.error('Client get error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/clients/[id] - Update client.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      phone,
      email,
      date_of_birth,
      gender,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      profile_photo_url,
      notes,
      skin_type,
      skin_concerns,
      allergies,
      contraindications,
      status,
      preferences,
    } = body;

    const normalizedPhone = phone !== undefined ? (phone ? formatPhoneNumber(String(phone)) : null) : undefined;
    const emailTrim = email !== undefined ? (typeof email === 'string' ? email.trim() || null : null) : undefined;

    // Duplicate check: if changing phone/email, ensure not taken by another client
    if (normalizedPhone !== undefined && normalizedPhone) {
      const dupPhone = await db.query(
        'SELECT id FROM clients WHERE id != $1 AND phone = $2 LIMIT 1',
        [clientId, normalizedPhone]
      );
      if (dupPhone.rows.length > 0) {
        return NextResponse.json(
          { error: 'Another client already has this phone number' },
          { status: 409 }
        );
      }
    }
    if (emailTrim !== undefined && emailTrim) {
      const dupEmail = await db.query(
        'SELECT id FROM clients WHERE id != $1 AND email IS NOT NULL AND LOWER(TRIM(email)) = LOWER($2) LIMIT 1',
        [clientId, emailTrim]
      );
      if (dupEmail.rows.length > 0) {
        return NextResponse.json(
          { error: 'Another client already has this email' },
          { status: 409 }
        );
      }
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const set = (col: string, val: unknown) => {
      updates.push(`${col} = $${idx}`);
      values.push(val);
      idx++;
    };
    if (name !== undefined) set('name', name.trim());
    if (phone !== undefined) set('phone', normalizedPhone);
    if (email !== undefined) set('email', emailTrim);
    if (date_of_birth !== undefined) set('date_of_birth', date_of_birth || null);
    if (gender !== undefined) set('gender', gender || null);
    if (address !== undefined) set('address', address || null);
    if (emergency_contact_name !== undefined) set('emergency_contact_name', emergency_contact_name || null);
    if (emergency_contact_phone !== undefined) set('emergency_contact_phone', emergency_contact_phone || null);
    if (profile_photo_url !== undefined) set('profile_photo_url', profile_photo_url || null);
    if (notes !== undefined) set('notes', notes || null);
    if (skin_type !== undefined) set('skin_type', skin_type || null);
    if (skin_concerns !== undefined) set('skin_concerns', skin_concerns || null);
    if (allergies !== undefined) set('allergies', allergies || null);
    if (contraindications !== undefined) set('contraindications', contraindications || null);
    if (status !== undefined && ['active', 'inactive', 'VIP', 'archived'].includes(status)) set('status', status);
    if (preferences !== undefined) set('preferences', typeof preferences === 'object' ? JSON.stringify(preferences) : null);

    if (updates.length === 0) {
      const r = await db.query('SELECT * FROM clients WHERE id = $1', [clientId]);
      return NextResponse.json(r.rows[0] ?? { error: 'Not found' }, r.rows[0] ? { status: 200 } : { status: 404 });
    }

    values.push(clientId);
    const result = await db.query(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('Client update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
