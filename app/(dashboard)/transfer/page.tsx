'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Account } from '@/types';
import TransferForm from '@/components/transactions/TransferForm';

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase.from('accounts').select('*').eq('status', 'active');
      setAccounts(data || []);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="space-y-1.5">
          <div className="h-7 w-44 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-56 bg-gray-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-slate-700 rounded-xl" />)}
            <div className="h-14 bg-gray-200 dark:bg-slate-600 rounded-xl" />
          </div>
          <div className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50">
        <p className="text-4xl mb-3">🏦</p>
        <p className="text-gray-600 dark:text-slate-300 font-medium">No active accounts found</p>
        <a href="/accounts" className="text-[#0066cc] dark:text-blue-400 text-sm mt-2 inline-block hover:underline">
          Create an account first
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Money</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Send funds securely to any account</p>
      </div>
      <TransferForm accounts={accounts} />
    </div>
  );
}
