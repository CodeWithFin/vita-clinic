import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/sms/templates/[id] - Update template (name, body, description). System templates: body/description only.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id, 10);
    if (!Number.isInteger(templateId)) {
      return NextResponse.json({ error: 'Invalid template id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, body: templateBody, description } = body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const row = await db.query(
      'SELECT id, is_system FROM sms_templates WHERE id = $1',
      [templateId]
    );
    if (row.rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const isSystem = row.rows[0].is_system;

    if (name !== undefined && !isSystem) {
      updates.push(`name = $${idx}`);
      values.push(String(name).trim());
      idx++;
    }
    if (templateBody !== undefined) {
      updates.push(`body = $${idx}`);
      values.push(String(templateBody).trim());
      idx++;
    }
    if (description !== undefined) {
      updates.push(`description = $${idx}`);
      values.push(typeof description === 'string' ? description.trim() : null);
      idx++;
    }

    if (updates.length === 0) {
      const r = await db.query('SELECT * FROM sms_templates WHERE id = $1', [templateId]);
      return NextResponse.json(r.rows[0]);
    }

    values.push(templateId);
    const result = await db.query(
      `UPDATE sms_templates SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_templates') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json(
        { error: 'SMS templates not found. Run node scripts/run-sms-migrations.js' },
        { status: 503 }
      );
    }
    console.error('SMS template update error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
