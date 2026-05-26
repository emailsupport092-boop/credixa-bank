import { NextResponse } from 'next/server';
import { getCryptoPrices } from '@/lib/crypto/rates';

export async function GET() {
  try {
    const prices = await getCryptoPrices();
    return NextResponse.json(prices, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
