'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Calculator, CreditCard, UserCheck, Receipt, Settings2 } from 'lucide-react';

const actions = [
  { href: '/transfer', label: 'Send Money', icon: ArrowLeftRight, color: 'bg-blue-500', hover: 'hover:bg-blue-600', desc: 'Transfer funds instantly' },
  { href: '/loan-calculator', label: 'Calculator', icon: Calculator, color: 'bg-purple-500', hover: 'hover:bg-purple-600', desc: 'Calculate repayments' },
  { href: '/cards', label: 'Cards', icon: CreditCard, color: 'bg-emerald-500', hover: 'hover:bg-emerald-600', desc: 'Manage your cards' },
  { href: '/kyc', label: 'KYC Verify', icon: UserCheck, color: 'bg-orange-500', hover: 'hover:bg-orange-600', desc: 'Verify your identity' },
  { href: '/transactions', label: 'History', icon: Receipt, color: 'bg-pink-500', hover: 'hover:bg-pink-600', desc: 'View transactions' },
  { href: '/settings', label: 'Settings', icon: Settings2, color: 'bg-teal-500', hover: 'hover:bg-teal-600', desc: 'Account settings' },
];

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map(({ href, label, icon: Icon, color, hover }, i) => (
          <motion.div key={href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              href={href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group text-center"
            >
              <div className={`${color} ${hover} w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300 group-hover:text-[#0066cc] dark:group-hover:text-blue-400 transition-colors leading-tight">
                {label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
