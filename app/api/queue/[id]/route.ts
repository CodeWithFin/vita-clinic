import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.query('UPDATE queue SET status = $1 WHERE id = $2', ['completed', id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Queue update error:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
