import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // user_id (patient)
        try {
            const result = await db.query(
                `SELECT pr.id, pr.user_id, pr.content, pr.created_at, pr.author_id, pr.form_data,
                        u.name as author_name
                 FROM patient_records pr
                 LEFT JOIN users u ON pr.author_id = u.id
                 WHERE pr.user_id = $1
                 ORDER BY pr.created_at DESC`,
                [id]
            );
            return NextResponse.json(result.rows);
        } catch (colErr: unknown) {
            const msg = colErr instanceof Error ? colErr.message : String(colErr);
            if (msg.includes('author_id') || msg.includes('form_data') || msg.includes('column')) {
                const fallback = await db.query(
                    'SELECT id, user_id, content, created_at FROM patient_records WHERE user_id = $1 ORDER BY created_at DESC',
                    [id]
                );
                return NextResponse.json(fallback.rows);
            }
            throw colErr;
        }
    } catch (err) {
        return NextResponse.json({ message: 'Error fetching records' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // user_id (patient)
        const patientId = parseInt(id, 10);
        if (Number.isNaN(patientId)) {
            return NextResponse.json({ message: 'Invalid patient id' }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        const { content, author_id, form_data } = body;
        const contentVal = typeof content === 'string' ? content : (content ?? '');
        const authorId = author_id != null ? Number(author_id) : null;
        // Keep arrays/objects (e.g. products_list); only drop null/empty string
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

        try {
            const result = await db.query(
                `INSERT INTO patient_records (user_id, content, author_id, form_data)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [patientId, contentVal, authorId, formDataJson]
            );

            const row = result.rows[0];
            if (row?.author_id) {
                const author = await db.query('SELECT name FROM users WHERE id = $1', [row.author_id]);
                (row as Record<string, unknown>).author_name = author.rows[0]?.name ?? null;
            }
            return NextResponse.json(row);
        } catch (insertErr: unknown) {
            const msg = insertErr instanceof Error ? insertErr.message : String(insertErr);
            // Schema not migrated: try without author_id and form_data
            if (msg.includes('author_id') || msg.includes('form_data') || msg.includes('column')) {
                const result = await db.query(
                    'INSERT INTO patient_records (user_id, content) VALUES ($1, $2) RETURNING *',
                    [patientId, contentVal]
                );
                return NextResponse.json(result.rows[0]);
            }
            throw insertErr;
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Error adding record';
        console.error('Patient records POST error:', err);
        return NextResponse.json({ message }, { status: 500 });
    }
}
