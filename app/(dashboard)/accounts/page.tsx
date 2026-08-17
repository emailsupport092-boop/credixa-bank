'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Account } from '@/types';
import { PlusCircle, CreditCard, TrendingUp, Wallet, Copy, Check, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const typeIcons: Record<string, any> = {
  savings: Wallet,
  current: CreditCard,
  investment: TrendingUp,
};

const typeColors: Record<string, string> = {
  savings: 'from-[#0066cc] to-[#004499]',
  current: 'from-[#10b981] to-[#059669]',
  investment: 'from-[#f59e0b] to-[#d97706]',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const supabase = createClient();

  const copyAccountNumber = async (id: string, accountNumber: string) => {
    await navigator.clipboard.writeText(accountNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from('accounts').select('*').order('created_at');
    setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const createAccount = async (type: string) => {
    setCreating(true);
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_type: type }),
    });
    if (res.ok) await fetchAccounts();
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-56 bg-gray-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="hidden sm:flex gap-2">
            {[1,2,3].map(i => <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-52 bg-gray-200 dark:bg-slate-700 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Accounts</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Total: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex gap-2">
          {['savings', 'current', 'investment'].map((type) => (
            <button
              key={type}
              onClick={() => createAccount(type)}
              disabled={creating || accounts.some((a) => a.account_type === type)}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:border-[#0066cc] hover:text-[#0066cc] dark:hover:border-blue-500 dark:hover:text-blue-400 disabled:opacity-40 transition-all capitalize"
            >
              <PlusCircle size={14} />
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((account, i) => {
          const Icon = typeIcons[account.account_type] || CreditCard;
          const gradient = typeColors[account.account_type] || typeColors.savings;
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-linear-to-br ${gradient} rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    account.status === 'active' ? 'bg-white/20 text-white' : 'bg-red-400/50 text-white'
                  }`}>
                    {account.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-white/70 text-sm capitalize">{account.account_type} Account</p>
                <p className="text-2xl font-bold mt-1">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/70 text-xs">Account Number</p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-white font-mono text-sm tracking-widest">
                      {account.account_number.replace(/(\w{4})/g, '$1 ').trim()}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyAccountNumber(account.id, account.account_number);
                      }}
                      className="shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Copy account number"
                    >
                      {copiedId === account.id ? (
                        <Check size={13} className="text-white" />
                      ) : (
                        <Copy size={13} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href={`/accounts/${account.id}/statement`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
                >
                  <FileText size={12} /> View Statement
                </Link>
              </div>
            </motion.div>
          );
        })}

        {accounts.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50">
            <CreditCard size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">No accounts yet</p>
            <button
              onClick={() => createAccount('savings')}
              className="mt-3 bg-[#0066cc] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#004499] transition-colors"
            >
              Open Your First Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
