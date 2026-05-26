import { CryptoPrice } from '@/types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINS = ['bitcoin', 'ethereum', 'cardano'];

export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch crypto prices');
  }

  return res.json();
}

export async function getExchangeRates() {
  const res = await fetch(`${COINGECKO_BASE}/exchange_rates`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  const data = await res.json();
  return data.rates;
}
