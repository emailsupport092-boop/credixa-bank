'use client';

import { Fragment, useEffect, useState } from 'react';
import { Search, Loader2, ChevronDown, Save, X, Settings2 } from 'lucide-react';

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: string;
  beneficiary_name?: string;
  bank_name?: string;
  purpose?: string;
  error_message?: string;
  success_message?: string;
  from_user_id?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending:   'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
  completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
  failed:    'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
  cancelled: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
};


export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function fetchTransactions(q = search, s = statusFilter) {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (q) params.set('search', q);
    if (s) params.set('status', s);
    const res = await fetch(`/api/admin/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { fetchTransactions(); }, []);

  function openEdit(tx: Transaction) {
    setEditingId(tx.id);
    setEditStatus(tx.status);
  }

  function closeEdit() {
    setEditingId(null);
    setEditStatus('');
  }

  async function handleSave(id: string) {
    setSaving(true);
    const res = await fetch('/api/admin/transactions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: editStatus }),
    });
    if (res.ok) {
      closeEdit();
      fetchTransactions();
    }
    setSaving(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchTransactions(search, statusFilter);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">{total} total transaction{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference, beneficiary, bank…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchTransactions(search, e.target.value); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-[#0066cc] text-white rounded-xl text-sm font-semibold hover:bg-[#004499] transition-colors">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#0066cc]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 dark:text-slate-500">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {['Reference', 'Beneficiary', 'Bank', 'Amount', 'Purpose', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {transactions.map((tx) => (
                  <Fragment key={tx.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-700 dark:text-slate-300">{tx.reference}</td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-slate-300">{tx.beneficiary_name || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-slate-400">{tx.bank_name || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 max-w-[140px] truncate">{tx.purpose || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[tx.status]}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {new Date(tx.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5">
                        {editingId === tx.id ? (
                          <button
                            onClick={closeEdit}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-xs text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <X size={13} /> Close
                          </button>
                        ) : (
                          <button
                            onClick={() => openEdit(tx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066cc] hover:bg-[#004499] text-white text-xs font-semibold transition-colors"
                          >
                            <Settings2 size={13} />
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editingId === tx.id && (
                      <tr className="bg-blue-50/60 dark:bg-blue-950/20">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="flex items-end gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                Update Status
                              </label>
                              <div className="relative">
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-2 max-w-xs">
                              The message shown to the user is configured in{' '}
                              <a href="/admin/settings" className="text-[#0066cc] dark:text-blue-400 hover:underline">
                                System Settings
                              </a>.
                            </p>
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={() => handleSave(tx.id)}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#0066cc] hover:bg-[#004499] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                              >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                Save
                              </button>
                              <button
                                onClick={closeEdit}
                                className="px-3 py-2 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
