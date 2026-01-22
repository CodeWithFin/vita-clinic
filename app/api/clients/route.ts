import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { clientId: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate unique client ID
    const clientCount = await prisma.client.count();
    const clientId = `VC${String(clientCount + 1).padStart(6, '0')}`;

    const client = await prisma.client.create({
      data: {
        ...body,
        clientId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
