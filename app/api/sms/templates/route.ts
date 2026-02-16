import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sms/templates - List SMS templates.
 */
export async function GET() {
  try {
    const result = await db.query(
      'SELECT id, name, slug, body, description, is_system, created_at, updated_at FROM sms_templates ORDER BY name'
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    if (msg.includes('sms_templates') || msg.includes('relation') || msg.includes('does not exist')) {
      return NextResponse.json([], { status: 200 });
    }
    console.error('SMS templates list error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
