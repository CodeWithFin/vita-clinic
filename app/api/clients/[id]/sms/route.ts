import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients/[id]/sms - SMS history for a client (delivery status, sent_at, message preview).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }

    const clientExists = await db.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientExists.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT id, phone, message, template_slug, appointment_id, direction, status, failure_reason, sent_at, created_by
       FROM sms_logs
       WHERE client_id = $1
       ORDER BY sent_at DESC
       LIMIT 100`,
      [clientId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_logs') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json([]);
    }
    console.error('Client SMS history error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
