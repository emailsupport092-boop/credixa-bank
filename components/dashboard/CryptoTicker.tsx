'use client';

import { useState, useEffect, useCallback } from 'react';
import { CryptoPrice } from '@/types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const cryptoSymbols: Record<string, string> = { bitcoin: '₿', ethereum: 'Ξ', cardano: '₳' };

function CoinCard({ coin }: { coin: CryptoPrice }) {
  const positive = coin.price_change_percentage_24h >= 0;
  return (
    <div className="shrink-0 w-56 bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700/50 hover:border-[#0066cc] dark:hover:border-blue-600 transition-colors mx-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-mono font-bold text-gray-500 dark:text-slate-400">
            {cryptoSymbols[coin.id] || coin.symbol.toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{coin.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase">{coin.symbol}</p>
          </div>
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
          positive
            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40'
            : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40'
        }`}>
          {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {positive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">
        ${coin.current_price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
        MCap: ${(coin.market_cap / 1e9).toFixed(1)}B
      </p>
    </div>
  );
}

export default function CryptoTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/crypto/prices');
      if (!res.ok) throw new Error('Failed to fetch');
      setPrices(await res.json());
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError('Unable to load crypto prices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Cryptocurrency</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="p-2 text-gray-400 dark:text-slate-500 hover:text-[#0066cc] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="text-center py-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg">
          {error}
        </div>
      )}

      {loading && !prices.length ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-56 h-24 animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl mx-2" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="ticker-track flex">
            {[...prices, ...prices, ...prices, ...prices].map((coin, i) => (
              <CoinCard key={`${coin.id}-${i}`} coin={coin} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
