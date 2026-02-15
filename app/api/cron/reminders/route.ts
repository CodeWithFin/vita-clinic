import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendSMSWithRetry, logSMSResult } from '@/lib/sms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/reminders - Send scheduled appointment reminders (1 day / 2 hours before).
 * Call via Vercel Cron or external scheduler (e.g. every 15 min). Optional: Authorization: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await db.query(
      `SELECT reminder_type, hours_before, template_slug, enabled FROM sms_reminder_settings WHERE enabled = true`
    );
    if (settings.rows.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No reminder settings' });
    }

    const templateRows = await db.query(
      'SELECT slug, body FROM sms_templates WHERE slug = ANY($1::text[])',
      [settings.rows.map((s: { template_slug: string }) => s.template_slug).filter(Boolean)]
    );
    const templateBySlug: Record<string, string> = {};
    templateRows.rows.forEach((r: { slug: string; body: string }) => {
      templateBySlug[r.slug] = r.body;
    });

    const now = new Date();
    let totalSent = 0;

    for (const setting of settings.rows) {
      const hoursBefore = Number(setting.hours_before);
      const templateSlug = setting.template_slug;
      if (!templateSlug || !templateBySlug[templateSlug]) continue;

      const windowStart = new Date(now.getTime() + (hoursBefore - 0.5) * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + (hoursBefore + 0.5) * 60 * 60 * 1000);

      const appointments = await db.query(
        `SELECT a.id, a.client_id, a.user_id, a.service_type, a.appointment_date,
                COALESCE(c.name, u.name) as client_name,
                COALESCE(c.phone, u.phone) as phone,
                c.sms_opt_in
         FROM appointments a
         LEFT JOIN clients c ON a.client_id = c.id
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.status NOT IN ('cancelled', 'completed')
           AND a.appointment_date >= $1 AND a.appointment_date <= $2
           AND (c.sms_opt_in IS NULL OR c.sms_opt_in = true)
           AND (COALESCE(c.phone, u.phone) IS NOT NULL AND TRIM(COALESCE(c.phone, u.phone)) != '')
           AND NOT EXISTS (
             SELECT 1 FROM sms_logs l
             WHERE l.appointment_id = a.id AND l.reminder_hours_before = $3
           )`,
        [windowStart, windowEnd, hoursBefore]
      );

      for (const apt of appointments.rows) {
        const phone = apt.phone?.trim();
        if (!phone) continue;

        const name = apt.client_name || 'there';
        const service = apt.service_type || 'your appointment';
        const dateStr = apt.appointment_date
          ? new Date(apt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '';
        const timeStr = apt.appointment_date
          ? new Date(apt.appointment_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          : '';

        let body = templateBySlug[templateSlug];
        body = body.replace(/\{\{name\}\}/g, name).replace(/\{\{service\}\}/g, service).replace(/\{\{date\}\}/g, dateStr).replace(/\{\{time\}\}/g, timeStr).replace(/\{\{reason\}\}/g, '');

        const result = await sendSMSWithRetry(phone, body);
        await logSMSResult({
          client_id: apt.client_id ?? null,
          user_id: apt.user_id ?? null,
          phone,
          message: body,
          template_slug: templateSlug,
          appointment_id: apt.id,
          reminder_hours_before: hoursBefore,
          result,
        });
        if (result.sent) totalSent++;
      }
    }

    return NextResponse.json({ sent: totalSent });
  } catch (err) {
    console.error('Reminders cron error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
