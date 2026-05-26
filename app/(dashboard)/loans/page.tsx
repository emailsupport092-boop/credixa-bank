'use client';

import { useEffect, useState } from 'react';
import { Loan } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanApplicationSchema, LoanApplicationFormData } from '@/lib/validators/auth';
import { PlusCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  approved:  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  active:    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
  rejected:  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  paid:      'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
  defaulted: 'bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300',
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { principalAmount: 10000, loanTerm: 24 },
  });

  const watchAmount = watch('principalAmount', 10000);
  const watchTerm = watch('loanTerm', 24);
  const rate = watchAmount > 100000 ? 2.5 : watchAmount > 50000 ? 3.5 : watchAmount > 10000 ? 4.5 : 5.5;
  const r = rate / 100 / 12;
  const monthly = watchAmount * (r * Math.pow(1 + r, watchTerm)) / (Math.pow(1 + r, watchTerm) - 1) || 0;

  const fetchLoans = async () => {
    const res = await fetch('/api/loans');
    if (res.ok) setLoans(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchLoans(); }, []);

  const onSubmit = async (data: LoanApplicationFormData) => {
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchLoans();
      setShowForm(false);
      reset();
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="h-72 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Loans</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{loans.length} loan{loans.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold px-4 py-2 rounded-xl transition-all active:scale-[0.98]"
        >
          <PlusCircle size={16} />
          Apply for Loan
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loan Application</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Loan Amount (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('principalAmount', { valueAsNumber: true })}
                  type="number" min={1000} max={500000}
                  className={inputCls}
                />
                {errors.principalAmount && <p className="text-xs text-red-500 mt-1">{errors.principalAmount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Loan Term (Months) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('loanTerm', { valueAsNumber: true })}
                  type="number" min={6} max={60}
                  className={inputCls}
                />
                {errors.loanTerm && <p className="text-xs text-red-500 mt-1">{errors.loanTerm.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Monthly Income (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('monthlyIncome', { valueAsNumber: true })}
                  type="number" min={1000} placeholder="5000"
                  className={inputCls}
                />
                {errors.monthlyIncome && <p className="text-xs text-red-500 mt-1">{errors.monthlyIncome.message}</p>}
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-[#0066cc] rounded-r-xl p-4">
                <p className="text-xs text-gray-500 dark:text-slate-400">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-[#0066cc] dark:text-blue-400">
                  ${isNaN(monthly) ? '0.00' : monthly.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">@ {rate}% APR</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Loan Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('purpose')}
                rows={3}
                placeholder="Describe the purpose of this loan..."
                className={`${inputCls} resize-none`}
              />
              {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose.message}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50">
          <DollarSign size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">No loans yet</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-[#0066cc] dark:text-blue-400 text-sm hover:underline">
            Apply for your first loan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/50 w-10 h-10 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-[#0066cc] dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${loan.principal_amount.toLocaleString()} Loan
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{loan.loan_term} months @ {loan.interest_rate}% APR</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[loan.status] || 'bg-gray-100 dark:bg-slate-700'}`}>
                  {loan.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 text-xs">Monthly</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${loan.monthly_payment?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp size={14} className="text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 text-xs">Total Interest</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">${loan.total_interest?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={14} className="text-gray-400 dark:text-slate-500" />
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 text-xs">Total Amount</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${loan.total_amount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
