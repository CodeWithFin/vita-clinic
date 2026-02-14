import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatPhoneNumber } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients/check-duplicates?phone=&email=&name=
 * Returns potential duplicate clients (by phone, email, or similar name).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone')?.trim();
    const email = searchParams.get('email')?.trim();
    const name = searchParams.get('name')?.trim();

    if (!phone && !email && !name) {
      return NextResponse.json(
        { error: 'Provide at least one of: phone, email, name' },
        { status: 400 }
      );
    }

    const params: (string | number)[] = [];
    const conditions: string[] = [];
    let i = 1;

    if (phone) {
      const normalized = formatPhoneNumber(phone);
      conditions.push(`(phone = $${i} OR phone = $${i + 1})`);
      params.push(normalized, phone);
      i += 2;
    }
    if (email) {
      conditions.push(`(email IS NOT NULL AND LOWER(TRIM(email)) = LOWER(TRIM($${i})))`);
      params.push(email);
      i++;
    }
    if (name && name.length >= 2) {
      conditions.push(`(LOWER(name) LIKE LOWER($${i}))`);
      params.push(`%${name.replace(/%/g, '\\%')}%`);
      i++;
    }

    const query = `
      SELECT id, client_id, name, phone, email, status, visit_count, created_at
      FROM clients
      WHERE ${conditions.join(' OR ')}
      ORDER BY visit_count DESC
      LIMIT 10
    `;
    const result = await db.query(query, params);
    return NextResponse.json({ duplicates: result.rows });
  } catch (err) {
    console.error('Check duplicates error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
