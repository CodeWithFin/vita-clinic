import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const queueSelectWithClient = `
  SELECT q.id, q.ticket_number, q.status, q.created_at, q.provider_id, q.client_id, q.user_id,
         COALESCE(c.name, u.name) as client_name,
         COALESCE(c.phone, u.phone) as phone,
         COALESCE(u.id, 0) as user_id
  FROM queue q
  LEFT JOIN clients c ON q.client_id = c.id
  LEFT JOIN users u ON q.user_id = u.id
`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');

    const statusFilter = providerId
      ? `(q.status = $1 OR q.status = $2) AND q.provider_id = $3`
      : `q.status = $1`;
    const params = providerId ? ['waiting', 'in_consultation', providerId] : ['waiting'];

    try {
      const result = await db.query(
        `${queueSelectWithClient} WHERE ${statusFilter} ORDER BY q.created_at ASC`,
        params
      );
      return NextResponse.json(result.rows);
    } catch (colErr: unknown) {
      const msg = colErr instanceof Error ? colErr.message : String(colErr);
      if (msg.includes('client_id') || msg.includes('clients') || msg.includes('column')) {
        const legacySelect = `
          SELECT q.id, q.ticket_number, q.status, q.created_at, q.provider_id, u.name as client_name, u.phone, u.id as user_id
          FROM queue q
          JOIN users u ON q.user_id = u.id
          WHERE ${statusFilter}
          ORDER BY q.created_at ASC
        `;
        const fallback = await db.query(legacySelect, params);
        return NextResponse.json(fallback.rows);
      }
      throw colErr;
    }
  } catch (err) {
    console.error('Queue fetch error:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
