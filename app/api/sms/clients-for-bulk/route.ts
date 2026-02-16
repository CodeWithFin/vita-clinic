import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sms/clients-for-bulk?status=active - Clients that can receive SMS (have phone, opted in).
 * For bulk SMS UI: list with id, name, phone, client_id. Optional status filter.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.trim() || '';

    let query = `
      SELECT id, client_id, name, phone
      FROM clients
      WHERE phone IS NOT NULL AND TRIM(phone) != '' AND (sms_opt_in IS NULL OR sms_opt_in = true)
    `;
    const params: string[] = [];
    if (status) {
      query += ` AND status = $1`;
      params.push(status);
    }
    query += ` ORDER BY name ASC LIMIT 500`;

    const result = await db.query(query, params.length ? params : undefined);
    return NextResponse.json(result.rows);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_opt_in') || msg.includes('column') || msg.includes('does not exist')) {
      try {
        const fallback = await db.query(
          `SELECT id, client_id, name, phone FROM clients WHERE phone IS NOT NULL AND TRIM(phone) != '' ORDER BY name ASC LIMIT 500`
        );
        return NextResponse.json(fallback.rows);
      } catch {
        return NextResponse.json([]);
      }
    }
    console.error('SMS clients-for-bulk error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
