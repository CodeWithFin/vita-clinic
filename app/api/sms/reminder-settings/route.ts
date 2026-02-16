import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sms/reminder-settings - List reminder schedule (1 day, same day, 2 hours, etc.)
 */
export async function GET() {
  try {
    const result = await db.query(
      `SELECT id, reminder_type, hours_before, template_slug, enabled, updated_at
       FROM sms_reminder_settings ORDER BY hours_before DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_reminder_settings') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json([], { status: 200 });
    }
    console.error('Reminder settings list error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/sms/reminder-settings - Update a reminder (e.g. enabled, hours_before).
 * Body: { id: number, enabled?: boolean, hours_before?: number }
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, enabled, hours_before } = body;
    const rid = id != null ? Number(id) : NaN;
    if (!Number.isInteger(rid)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (typeof enabled === 'boolean') {
      updates.push(`enabled = $${idx}`);
      values.push(enabled);
      idx++;
    }
    if (typeof hours_before === 'number' && hours_before >= 0) {
      updates.push(`hours_before = $${idx}`);
      values.push(hours_before);
      idx++;
    }
    if (updates.length === 0) {
      const r = await db.query('SELECT * FROM sms_reminder_settings WHERE id = $1', [rid]);
      return NextResponse.json(r.rows[0] ?? { error: 'Not found' }, r.rows[0] ? { status: 200 } : { status: 404 });
    }
    values.push(rid);
    const result = await db.query(
      `UPDATE sms_reminder_settings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_reminder_settings') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json({ error: 'Table not found. Run SMS migrations (scripts/run-sms-migrations.js).' }, { status: 503 });
    }
    console.error('Reminder settings update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
