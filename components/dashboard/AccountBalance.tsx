'use client';

import { Account } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props { accounts: Account[]; }

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function AccountBalance({ accounts }: Props) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const cards = [
    { title: 'Total Balance', value: formatCurrency(totalBalance), subtitle: `${accounts.length} account${accounts.length !== 1 ? 's' : ''}`, border: '#0066cc', bg: 'bg-blue-50 dark:bg-blue-950/40', icon: '💳', change: '+2.4%', positive: true },
    { title: 'Monthly Spending', value: formatCurrency(1200), subtitle: '8 transactions this month', border: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: '📊', change: '-3.1%', positive: false },
    { title: 'Available Balance', value: formatCurrency(totalBalance * 0.95), subtitle: 'Updated just now', border: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/40', icon: '✅', change: '+5.2%', positive: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6 relative overflow-hidden hover:shadow-md dark:hover:shadow-black/20 transition-shadow"
          style={{ borderLeft: `4px solid ${card.border}` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
            </div>
            <div className={`${card.bg} w-10 h-10 rounded-xl flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 dark:text-slate-500">{card.subtitle}</p>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {card.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.change}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
