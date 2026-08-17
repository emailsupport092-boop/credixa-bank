'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

interface StatementRow {
  id: string;
  created_at: string;
  reference: string;
  type: string;
  status: string;
  direction: 'credit' | 'debit';
  counterparty_name?: string;
  description?: string;
  amount: number;
}

interface Statement {
  account: {
    id: string;
    account_number: string;
    account_type: string;
    currency: string;
    balance: number;
  };
  period: { value: string; label: string; start: string; end: string };
  transactions: StatementRow[];
  totals: { credits: number; debits: number; net: number; count: number };
}

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function StatementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [month, setMonth] = useState(currentMonthValue());
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    (async () => {
      const res = await fetch(`/api/accounts/${id}/statement?month=${month}`);
      const data = await res.json();
      if (res.ok) {
        setStatement(data);
      } else {
        setError(data.error || 'Failed to load statement');
      }
      setLoading(false);
    })();
  }, [id, month]);

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.push('/accounts')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Accounts
        </button>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            max={currentMonthValue()}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
          />
          <button
            onClick={() => window.print()}
            disabled={!statement}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#0066cc]/20 border-t-[#0066cc] rounded-full animate-spin" />
        </div>
      ) : error || !statement ? (
        <div className="text-center py-16 text-gray-500 dark:text-slate-400">{error || 'Statement not found'}</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden print-area">
          <div className="bg-linear-to-br from-[#0066cc] to-[#004499] p-8">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-black">C</span>
              </div>
              <span className="text-white font-bold text-lg">Credixa Bank</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
              <FileText size={14} /> Statement of Account
            </div>
            <h1 className="text-2xl font-bold text-white">{statement.period.label}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-1 mt-4 text-sm">
              <div>
                <p className="text-blue-200">Account Number</p>
                <p className="text-white font-mono font-semibold">
                  {statement.account.account_number.replace(/(\w{4})/g, '$1 ').trim()}
                </p>
              </div>
              <div>
                <p className="text-blue-200">Account Type</p>
                <p className="text-white font-semibold capitalize">{statement.account.account_type}</p>
              </div>
              <div>
                <p className="text-blue-200">Currency</p>
                <p className="text-white font-semibold">{statement.account.currency}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700/50 border-b border-gray-100 dark:border-slate-700/50">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Money In</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(statement.totals.credits)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Money Out</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">{fmt(statement.totals.debits)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Net Change</p>
              <p className={`text-lg font-bold mt-1 ${statement.totals.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {statement.totals.net >= 0 ? '+' : ''}{fmt(statement.totals.net)}
              </p>
            </div>
          </div>

          {statement.transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500">
              No transactions in {statement.period.label}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                    {['Date', 'Description', 'Reference', 'Status', 'Amount'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {statement.transactions.map((t) => {
                    const signed = t.direction === 'credit' ? t.amount : -t.amount;
                    return (
                      <tr key={t.id}>
                        <td className="px-5 py-3 whitespace-nowrap text-gray-600 dark:text-slate-300">
                          {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-gray-700 dark:text-slate-300">
                          {t.counterparty_name || t.description || t.type}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-400 dark:text-slate-500">{t.reference}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-slate-400 capitalize">{t.status}</td>
                        <td className={`px-5 py-3 font-semibold whitespace-nowrap ${signed < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          <span className="inline-flex items-center gap-1">
                            {signed < 0 ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                            {signed < 0 ? '-' : '+'}{fmt(Math.abs(signed))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-5 border-t border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Balances reflect completed transactions only; a pending transfer out is held immediately and refunded if it fails.
            </p>
            <div className="text-right shrink-0 ml-4">
              <p className="text-xs text-gray-400 dark:text-slate-500">Current Balance (as of today)</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{fmt(statement.account.balance)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
