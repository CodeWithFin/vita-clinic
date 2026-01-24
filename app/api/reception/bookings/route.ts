import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // In a real production app, we should verify the Authorization header/token here
    // const authHeader = req.headers.get('authorization'); 
    
    const result = await db.query(`
      SELECT 
        a.id, 
        a.service_type, 
        a.appointment_date, 
        a.status, 
        u.id as user_id,
        u.name as client_name, 
        u.phone, 
        u.email 
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.appointment_date DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
