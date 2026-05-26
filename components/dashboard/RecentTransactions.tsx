'use client';

import { Transaction } from '@/types';
import { CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Props {
  transactions: Transaction[];
  currentUserId?: string;
}

const categoryIcons: Record<string, string> = {
  transfer: '💸', deposit: '💰', withdrawal: '🏧', payment: '💳', refund: '↩️',
};

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { icon: <CheckCircle size={12} />, label: 'Completed', classes: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
    pending:   { icon: <Clock size={12} />,        label: 'Pending',   classes: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' },
    failed:    { icon: <XCircle size={12} />,       label: 'Failed',    classes: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' },
    cancelled: { icon: <XCircle size={12} />,       label: 'Cancelled', classes: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400' },
  }[status] || { icon: null, label: status, classes: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.icon}{config.label}
    </span>
  );
}

export default function RecentTransactions({ transactions, currentUserId }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm text-[#0066cc] dark:text-blue-400 hover:text-[#004499] dark:hover:text-blue-300 font-medium">
          View All →
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-4xl mb-2">💸</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">No transactions yet</p>
          <Link href="/transfer" className="text-[#0066cc] dark:text-blue-400 text-sm mt-1 inline-block hover:underline">
            Make your first transfer
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50">
                {['Date', 'Description', 'Category', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
              {transactions.map((tx) => {
                const isSent = tx.from_user_id === currentUserId;
                const amount = isSent ? -tx.amount : tx.amount;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-slate-200">{format(new Date(tx.created_at), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500">{format(new Date(tx.created_at), 'h:mm a')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[tx.type] || '💳'}</span>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-slate-200">{tx.description || 'Transfer'}</p>
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
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
