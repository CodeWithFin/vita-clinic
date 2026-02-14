import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients/[id]/records - Treatment/consultation records for a client (by client_id).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }

    try {
      const result = await db.query(
        `SELECT pr.id, pr.user_id, pr.client_id, pr.content, pr.created_at, pr.author_id, pr.form_data,
                u.name as author_name
         FROM patient_records pr
         LEFT JOIN users u ON pr.author_id = u.id
         WHERE pr.client_id = $1
         ORDER BY pr.created_at DESC`,
        [clientId]
      );
      return NextResponse.json(result.rows);
    } catch (colErr: unknown) {
      if (String(colErr).includes('client_id') || String(colErr).includes('column')) {
        return NextResponse.json([]);
      }
      throw colErr;
    }
  } catch (err) {
    console.error('Client records error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/clients/[id]/records - Add a treatment note for a client.
 * Body: { content: string, author_id?: number, form_data?: object }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client id' }, { status: 400 });
    }
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { content, author_id, form_data } = body;
    const contentVal = typeof content === 'string' ? content : (content ?? '');
    const authorId = author_id != null ? Number(author_id) : null;
    const formDataJson =
      form_data && typeof form_data === 'object'
        ? JSON.stringify(
            Object.fromEntries(
              Object.entries(form_data).filter(([, v]) => {
                if (v == null) return false;
                if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return true;
                return String(v).trim() !== '';
              })
            ) || {}
          )
        : null;

    const result = await db.query(
      `INSERT INTO patient_records (client_id, content, author_id, form_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clientId, contentVal, authorId, formDataJson]
    );
    const row = result.rows[0];
    if (row?.author_id) {
      const author = await db.query('SELECT name FROM users WHERE id = $1', [row.author_id]);
      (row as Record<string, unknown>).author_name = author.rows[0]?.name ?? null;
    }
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (String(err).includes('client_id') || String(err).includes('column')) {
      return NextResponse.json(
        { error: 'Clients migration not applied' },
        { status: 503 }
      );
    }
    console.error('Client records POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
