'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AccountBalance from '@/components/dashboard/AccountBalance';
import CryptoTicker from '@/components/dashboard/CryptoTicker';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import QuickActions from '@/components/dashboard/QuickActions';
import { Account, Transaction } from '@/types';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [accountsRes, txRes] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: true }),
        supabase
          .from('transactions')
          .select('*')
          .or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`)
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      setAccounts(accountsRes.data || []);
      setTransactions(txRes.data || []);
      setLoading(false);
    };

    if (user?.id) fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}
        </div>
        <div className="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hi, {user?.first_name || 'Welcome'} 👋
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · {format(new Date(), 'h:mm a')}
          </p>
        </div>
        {user?.kyc_status !== 'verified' && (
          <a
            href="/kyc"
            className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            ⚠️ Complete KYC Verification
          </a>
        )}
      </div>

      {/* Balance cards */}
      <AccountBalance accounts={accounts} />

      {/* Crypto ticker */}
      <CryptoTicker />

      {/* Recent transactions */}
      <RecentTransactions transactions={transactions} currentUserId={user?.id} />

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
