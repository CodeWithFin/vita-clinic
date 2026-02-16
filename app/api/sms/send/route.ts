import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMSWithRetry, logSMSResult } from '@/lib/sms';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sms/send - Manual send SMS (reception/admin).
 * Body: { client_id?: number, phone?: string, message: string, use_retry?: boolean, created_by?: number }
 * If client_id: resolve phone from client and respect sms_opt_in.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { client_id, phone: rawPhone, message, use_retry = true, created_by } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    let phone: string | null = null;
    let userId: number | null = null;
    let clientId: number | null = null;

    if (client_id != null) {
      const cid = Number(client_id);
      if (!Number.isInteger(cid)) {
        return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
      }
      let client: { rows: { id: number; phone: string | null; sms_opt_in?: boolean }[] };
      try {
        client = await db.query(
          'SELECT id, phone, sms_opt_in FROM clients WHERE id = $1',
          [cid]
        );
      } catch (e) {
        const msg = (e as Error)?.message ?? String(e);
        if (msg.includes('sms_opt_in') || msg.includes('column') || msg.includes('does not exist')) {
          client = await db.query('SELECT id, phone FROM clients WHERE id = $1', [cid]);
        } else throw e;
      }
      if (client.rows.length === 0) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      const row = client.rows[0];
      if (row.sms_opt_in === false) {
        return NextResponse.json(
          { error: 'Client has opted out of SMS' },
          { status: 403 }
        );
      }
      phone = row.phone ?? null;
      clientId = row.id;
    } else if (rawPhone && typeof rawPhone === 'string') {
      phone = rawPhone.trim();
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Provide client_id or phone' },
        { status: 400 }
      );
    }

    const result = use_retry
      ? await sendSMSWithRetry(phone, message.trim())
      : await (await import('@/lib/sms')).sendSMS(phone, message.trim());

    await logSMSResult({
      client_id: clientId,
      user_id: userId,
      phone,
      message: message.trim(),
      created_by: created_by != null ? Number(created_by) : null,
      result,
    });

    return NextResponse.json({
      sent: result.sent,
      ...(result.sent ? {} : { reason: result.reason }),
    });
  } catch (err) {
    console.error('SMS send error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
