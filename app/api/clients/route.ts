import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients?q=search&status=active
 * Search by name, phone, or client_id. Filter by status.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    let query = `
      SELECT id, client_id, name, date_of_birth, gender, phone, email, status,
             total_spent, visit_count, created_at
      FROM clients
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let i = 1;

    if (status) {
      query += ` AND status = $${i}`;
      params.push(status);
      i++;
    }
    if (q) {
      const like = `%${q.replace(/%/g, '\\%')}%`;
      query += ` AND (
        name ILIKE $${i} OR
        phone LIKE $${i} OR
        email ILIKE $${i} OR
        client_id ILIKE $${i}
      )`;
      params.push(like);
      i++;
    }
    query += ` ORDER BY name ASC LIMIT 50`;

    const result = await db.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Clients list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/clients - Create client (with duplicate check).
 * Body: name, phone?, email?, date_of_birth?, gender?, address?, emergency_contact_name?, emergency_contact_phone?,
 *       notes?, skin_type?, skin_concerns?, allergies?, contraindications?, status?, preferences? (object)
 */
export async function POST(req: Request) {
  try {
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
      notes,
      skin_type,
      skin_concerns,
      allergies,
      contraindications,
      status = 'active',
      preferences,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const normalizedPhone = phone ? formatPhoneNumber(String(phone)) : null;
    const emailTrim = typeof email === 'string' ? email.trim() || null : null;

    // Duplicate detection: same phone or same email (if provided)
    const dupCheck = await db.query(
      `SELECT id, client_id, name, phone, email FROM clients
       WHERE (phone IS NOT NULL AND phone = $1) OR (email IS NOT NULL AND email IS NOT NULL AND email = $2)
       LIMIT 5`,
      [normalizedPhone, emailTrim]
    );
    if (dupCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Duplicate client', duplicates: dupCheck.rows },
        { status: 409 }
      );
    }

    const preferencesJson =
      preferences && typeof preferences === 'object'
        ? JSON.stringify(preferences)
        : null;
    const validStatus = ['active', 'inactive', 'VIP', 'archived'].includes(status)
      ? status
      : 'active';

    const result = await db.query(
      `INSERT INTO clients (
        name, phone, email, date_of_birth, gender, address,
        emergency_contact_name, emergency_contact_phone,
        notes, skin_type, skin_concerns, allergies, contraindications,
        status, preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        name.trim(),
        normalizedPhone,
        emailTrim,
        date_of_birth || null,
        gender || null,
        address || null,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        notes || null,
        skin_type || null,
        skin_concerns || null,
        allergies || null,
        contraindications || null,
        validStatus,
        preferencesJson,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Client create error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
