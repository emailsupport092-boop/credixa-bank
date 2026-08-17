'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Transaction } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownLeft, Search, Filter, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  pending:   'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  failed:    'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  cancelled: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
};

const typeEmojis: Record<string, string> = {
  transfer: '💸', deposit: '💰', withdrawal: '🏧', payment: '💳', refund: '↩️',
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const supabase = createClient();
  const limit = 10;

  const fetchTransactions = async () => {
    if (!user?.id) return;
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filter !== 'all') {
      if (filter === 'sent') query = query.eq('from_user_id', user.id);
      if (filter === 'received') query = query.eq('to_user_id', user.id);
      if (['pending', 'completed', 'failed'].includes(filter)) query = query.eq('status', filter);
    }

    const { data, count } = await query;
    setTransactions(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [user?.id, page, filter]);

  const filtered = transactions.filter((tx) =>
    !search ||
    tx.description?.toLowerCase().includes(search.toLowerCase()) ||
    tx.reference.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50" />
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 overflow-hidden">
          <div className="h-10 bg-gray-50 dark:bg-slate-900/50" />
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-16 border-t border-gray-50 dark:border-slate-700/30 px-4 py-3 flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-100 dark:bg-slate-700 rounded" />
              <div className="h-4 flex-1 bg-gray-100 dark:bg-slate-700 rounded" />
              <div className="h-4 w-20 bg-gray-100 dark:bg-slate-700 rounded" />
              <div className="h-4 w-20 bg-gray-100 dark:bg-slate-700 rounded" />
              <div className="h-6 w-20 bg-gray-100 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">{total} total transactions</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-gray-500 dark:text-slate-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50">
                  {['Date & Time', 'Description', 'Category', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {filtered.map((tx) => {
                  const isSent = tx.from_user_id === user?.id;
                  const amount = isSent ? -tx.amount : tx.amount;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-slate-200">{format(new Date(tx.created_at), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500">{format(new Date(tx.created_at), 'h:mm a')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{typeEmojis[tx.type] || '💳'}</span>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-slate-200">{tx.description || tx.type}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">{tx.reference}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 capitalize">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {amount < 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          {amount < 0 ? '-' : '+'}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status] || 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                          {tx.status === 'completed' ? <CheckCircle size={10} /> : tx.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066cc] dark:text-blue-400 hover:underline"
                        >
                          <Receipt size={12} /> Receipt
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700/50">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
