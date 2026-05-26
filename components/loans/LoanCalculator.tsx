'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Calendar, DollarSign, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function calcLoan(principal: number, months: number) {
  const rate = principal > 100000 ? 2.5 : principal > 50000 ? 3.5 : principal > 10000 ? 4.5 : 5.5;
  const r = rate / 100 / 12;
  const monthly = r > 0
    ? principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    : principal / months;
  const total = monthly * months;
  return { monthly, total, interest: total - principal, rate };
}

const AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];
const TERMS   = [6, 12, 24, 36, 48, 60];

export default function LoanCalculator() {
  const router = useRouter();
  const [amount, setAmount] = useState(25000);
  const [term, setTerm] = useState(24);

  const { monthly, total, interest, rate } = calcLoan(amount, term);
  const principalPct = Math.round((amount / total) * 100);
  const interestPct  = 100 - principalPct;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ── Left: Controls ── */}
      <div className="space-y-5">
        {/* Amount */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Loan Amount</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{fmt(amount)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center shrink-0">
              <DollarSign size={22} className="text-[#0066cc] dark:text-blue-400" />
            </div>
          </div>
          <input
            type="range" min={1000} max={500000} step={1000} value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1.5 mb-4">
            <span>$1K</span><span>$500K</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AMOUNTS.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  amount === v
                    ? 'bg-[#0066cc] text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {fmt(v)}
              </button>
            ))}
          </div>
        </div>

        {/* Term */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Loan Term</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white">
                {term}<span className="text-2xl text-gray-400 dark:text-slate-500 font-normal ml-1">mo</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar size={22} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <input
            type="range" min={6} max={60} step={1} value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1.5 mb-4">
            <span>6mo</span><span>60mo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TERMS.map((v) => (
              <button
                key={v}
                onClick={() => setTerm(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  term === v
                    ? 'bg-[#0066cc] text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {v}mo
              </button>
            ))}
          </div>
        </div>

        {/* APR */}
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4">
          <TrendingUp size={20} className="text-[#0066cc] dark:text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Estimated APR</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Based on amount · Subject to credit check</p>
          </div>
          <span className="text-2xl font-black text-[#0066cc] dark:text-blue-400 shrink-0">{rate}%</span>
        </div>
      </div>

      {/* ── Right: Results ── */}
      <div className="space-y-5">
        {/* Monthly hero */}
        <motion.div
          key={`${amount}-${term}`}
          initial={{ scale: 0.98, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-linear-to-br from-[#0066cc] to-[#003d99] rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20"
        >
          <p className="text-blue-200 text-sm font-medium">Monthly Payment</p>
          <p className="text-5xl font-black mt-1 tracking-tight">{fmtFull(monthly)}</p>
          <p className="text-blue-200 text-sm mt-1">over {term} months at {rate}% APR</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Principal', value: fmt(amount),   sub: `${principalPct}%` },
              { label: 'Interest',  value: fmt(interest),  sub: `${interestPct}%` },
              { label: 'Total Due', value: fmt(total),     sub: 'repayment' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-blue-200 text-xs">{label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{value}</p>
                <p className="text-blue-300 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h3>

          <div className="h-5 rounded-full overflow-hidden flex mb-3">
            <motion.div
              className="bg-[#0066cc] h-full"
              animate={{ width: `${principalPct}%` }}
              transition={{ duration: 0.4 }}
            />
            <div className="bg-red-400 h-full flex-1" />
          </div>

          <div className="flex gap-4 text-xs mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0066cc]" />
              <span className="text-gray-500 dark:text-slate-400">Principal ({principalPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-gray-500 dark:text-slate-400">Interest ({interestPct}%)</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {[
              { label: 'Loan Principal',   value: fmtFull(amount),   cls: 'text-gray-900 dark:text-white' },
              { label: 'Total Interest',   value: fmtFull(interest),  cls: 'text-red-500 dark:text-red-400' },
              { label: 'Total Repayment',  value: fmtFull(total),     cls: 'text-gray-900 dark:text-white font-bold' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between py-3 text-sm">
                <span className="text-gray-500 dark:text-slate-400">{label}</span>
                <span className={cls}>{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 flex items-center gap-1.5">
            <Info size={12} className="shrink-0" />
            Estimated approval: 2–3 business days. Rate subject to credit assessment.
          </p>
        </div>

        <button
          onClick={() => router.push('/loans')}
          className="w-full bg-[#0066cc] hover:bg-[#004499] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Calculator size={20} />
          Apply for {fmt(amount)} Loan
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
