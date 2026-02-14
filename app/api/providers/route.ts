import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/providers - List service providers (users with role doctor).
 */
export async function GET() {
  try {
    const result = await db.query(
      `SELECT id, name, email FROM users WHERE role IN ('doctor', 'admin') ORDER BY name ASC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Providers list error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
