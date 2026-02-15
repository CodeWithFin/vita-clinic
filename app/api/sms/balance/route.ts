import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sms/balance - SMS credit balance (Tilil or other provider).
 * If TILIL_BALANCE_ENDPOINT is set, fetches from API; otherwise returns a stub.
 */
export async function GET() {
  try {
    const endpoint = process.env.TILIL_BALANCE_ENDPOINT;
    if (!endpoint || !process.env.TILIL_API_KEY) {
      return NextResponse.json({
        available: null,
        message: 'SMS balance not configured. Set TILIL_BALANCE_ENDPOINT and TILIL_API_KEY to enable.',
      });
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.TILIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json({
        available: null,
        message: (data as { message?: string })?.message || `API returned ${response.status}`,
      });
    }

    const available =
      typeof (data as { balance?: number }).balance === 'number'
        ? (data as { balance: number }).balance
        : typeof (data as { credits?: number }).credits === 'number'
          ? (data as { credits: number }).credits
          : null;

    return NextResponse.json({ available, raw: data });
  } catch (err) {
    console.error('SMS balance error:', err);
    return NextResponse.json({
      available: null,
      message: err instanceof Error ? err.message : 'Failed to fetch balance',
    });
  }
}
