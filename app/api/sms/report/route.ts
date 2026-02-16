import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sms/report - Delivery report: recent sends and summary counts.
 * Query: limit=50 (default), days=7 (summary over last N days)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') || '7', 10) || 7));

    const since = new Date();
    since.setDate(since.getDate() - days);

    const [recent, summary] = await Promise.all([
      db.query(
        `SELECT l.id, l.client_id, l.phone, l.message, l.template_slug, l.status, l.failure_reason, l.sent_at,
                c.name as client_name
         FROM sms_logs l
         LEFT JOIN clients c ON l.client_id = c.id
         ORDER BY l.sent_at DESC
         LIMIT $1`,
        [limit]
      ),
      db.query(
        `SELECT status, COUNT(*)::int as count FROM sms_logs WHERE sent_at >= $1 GROUP BY status`,
        [since]
      ),
    ]);

    const byStatus: Record<string, number> = {};
    summary.rows.forEach((r: { status: string; count: number }) => {
      byStatus[r.status] = r.count;
    });

    return NextResponse.json({
      recent: recent.rows,
      summary: { sent: byStatus.sent ?? 0, failed: byStatus.failed ?? 0, total: (byStatus.sent ?? 0) + (byStatus.failed ?? 0) },
      days,
    });
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_logs') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json({ recent: [], summary: { sent: 0, failed: 0, total: 0 }, days: 7 });
    }
    console.error('SMS report error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
