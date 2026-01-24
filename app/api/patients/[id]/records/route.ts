import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // user_id
        const result = await db.query(
            'SELECT * FROM patient_records WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );
        return NextResponse.json(result.rows);
    } catch (err) {
        return NextResponse.json({ message: 'Error fetching records' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // user_id
        const { content } = await request.json();
        
        const result = await db.query(
            'INSERT INTO patient_records (user_id, content) VALUES ($1, $2) RETURNING *',
            [id, content]
        );
        
        return NextResponse.json(result.rows[0]);
    } catch (err) {
        return NextResponse.json({ message: 'Error adding record' }, { status: 500 });
    }
}
