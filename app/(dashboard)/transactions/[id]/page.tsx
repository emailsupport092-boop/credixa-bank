'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransactionDetail {
  id: string;
  reference: string;
  type: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  purpose?: string;
  description?: string;
  created_at: string;
  direction: 'sent' | 'received';
  is_internal: boolean;
  counterparty_name?: string;
  own_account_number?: string;
  counterparty_account_number?: string;
  bank_name?: string;
  bank_address?: string;
  swift_code?: string;
  routing_number?: string;
  error_message?: string;
  success_message?: string;
}

const statusStyles: Record<string, { badge: string; banner: string; icon: typeof CheckCircle }> = {
  completed: {
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    banner: 'from-emerald-500 to-emerald-600',
    icon: CheckCircle,
  },
  pending: {
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    banner: 'from-amber-500 to-amber-600',
    icon: Clock,
  },
  failed: {
    badge: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    banner: 'from-red-500 to-red-600',
    icon: XCircle,
  },
  cancelled: {
    badge: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
    banner: 'from-gray-400 to-gray-500',
    icon: XCircle,
  },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}

export default function TransactionReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/transactions/${id}`);
      const data = await res.json();
      if (res.ok) {
        setTx(data);
      } else {
        setError(data.error || 'Transaction not found');
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-16 flex justify-center">
        <div className="w-8 h-8 border-2 border-[#0066cc]/20 border-t-[#0066cc] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-gray-500 dark:text-slate-400 mb-4">{error || 'Transaction not found'}</p>
        <button
          onClick={() => router.push('/transactions')}
          className="inline-flex items-center gap-2 text-[#0066cc] dark:text-blue-400 font-semibold hover:underline"
        >
          <ArrowLeft size={16} /> Back to Transactions
        </button>
      </div>
    );
  }

  const style = statusStyles[tx.status] || statusStyles.pending;
  const StatusIcon = style.icon;
  const isSent = tx.direction === 'sent';
  const signedAmount = isSent ? -tx.amount : tx.amount;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <button
        onClick={() => router.push('/transactions')}
        className="no-print inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={14} /> Back to Transactions
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden print-area">
        <div className={`bg-linear-to-br ${style.banner} p-8 text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <StatusIcon size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white capitalize">{tx.status}</h2>
          <p className="text-white/80 text-sm mt-1">
            {isSent ? 'Money Sent' : 'Money Received'}
          </p>
        </div>

        <div className="p-6 space-y-0.5">
          <DetailRow label="Transaction ID" value={tx.reference} />
          <DetailRow label={isSent ? 'Recipient' : 'From'} value={tx.counterparty_name || '—'} />
          {tx.bank_name && <DetailRow label="Bank Name" value={tx.bank_name} />}
          {tx.counterparty_account_number && (
            <DetailRow label={isSent ? 'Recipient Account' : 'Sender Account'} value={tx.counterparty_account_number} />
          )}
          {tx.own_account_number && (
            <DetailRow label="Your Account" value={tx.own_account_number} />
          )}
          <DetailRow
            label="Amount"
            value={`${signedAmount < 0 ? '-' : '+'}$${Math.abs(signedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />
          {tx.purpose && <DetailRow label="Purpose" value={tx.purpose} />}
          {tx.swift_code && <DetailRow label="Swift Code" value={tx.swift_code} />}
          {tx.routing_number && <DetailRow label="Routing Number" value={tx.routing_number} />}
          <DetailRow
            label="Date & Time"
            value={new Date(tx.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          />
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-gray-500 dark:text-slate-400">Status</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${style.badge}`}>
              {tx.status}
            </span>
          </div>
          {tx.status === 'completed' && tx.success_message && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-2">{tx.success_message}</p>
          )}
          {tx.status === 'failed' && tx.error_message && (
            <p className="text-xs text-red-600 dark:text-red-400 pt-2">{tx.error_message}</p>
          )}
        </div>

        <div className="px-6 pb-6 no-print">
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer size={16} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
