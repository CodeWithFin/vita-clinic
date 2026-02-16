import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMSWithRetry, logSMSResult } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sms/bulk - Bulk SMS to multiple clients (e.g. by filter or explicit client_ids).
 * Body: { client_ids?: number[], message: string, created_by?: number }
 * Only sends to clients with sms_opt_in = true and valid phone.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { client_ids, message, created_by } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    let ids: number[] = [];
    if (Array.isArray(client_ids)) {
      ids = client_ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id));
    }
    if (ids.length === 0) {
      return NextResponse.json({ error: 'client_ids array is required and must not be empty' }, { status: 400 });
    }

    let clients: { rows: { id: number; name: string; phone: string }[] };
    try {
      clients = await db.query(
        `SELECT id, name, phone FROM clients WHERE id = ANY($1::int[]) AND (sms_opt_in IS NULL OR sms_opt_in = true) AND phone IS NOT NULL AND TRIM(phone) != ''`,
        [ids]
      );
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      if (msg.includes('sms_opt_in') || msg.includes('column') || msg.includes('does not exist')) {
        clients = await db.query(
          `SELECT id, name, phone FROM clients WHERE id = ANY($1::int[]) AND phone IS NOT NULL AND TRIM(phone) != ''`,
          [ids]
        );
      } else throw e;
    }

    const results: { client_id: number; sent: boolean; reason?: string }[] = [];
    const createdBy = created_by != null ? Number(created_by) : null;

    for (const row of clients.rows) {
      const result = await sendSMSWithRetry(row.phone, message.trim());
      await logSMSResult({
        client_id: row.id,
        user_id: null,
        phone: row.phone,
        message: message.trim(),
        created_by: createdBy,
        result,
      });
      results.push({
        client_id: row.id,
        sent: result.sent,
        ...(result.sent ? {} : { reason: result.reason }),
      });
    }

    const sent = results.filter((r) => r.sent).length;
    const failed = results.filter((r) => !r.sent).length;
    const skipped = ids.length - clients.rows.length;

    return NextResponse.json({
      total: ids.length,
      sent,
      failed,
      skipped,
      results,
    });
  } catch (err) {
    console.error('SMS bulk error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
