'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account } from '@/types';
import { transferSchema, TransferFormData } from '@/lib/validators/auth';
import Modal from '@/components/common/Modal';
import { CheckCircle, Send, Zap, Clock, Globe } from 'lucide-react';

interface Props {
  accounts: Account[];
}

const speeds = [
  { id: 'instant',  label: 'Instant',  desc: 'Immediate',  fee: 2.5, icon: Zap },
  { id: 'standard', label: 'Standard', desc: '1–2 hours',  fee: 0,   icon: Clock },
  { id: 'economy',  label: 'Economy',  desc: '24 hours',   fee: 0,   icon: Globe },
];

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';

export default function TransferForm({ accounts }: Props) {
  const [selectedSpeed, setSelectedSpeed] = useState<'instant' | 'standard' | 'economy'>('standard');
  const [successModal, setSuccessModal] = useState(false);
  const [txDetails, setTxDetails] = useState<any>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { transferSpeed: 'standard', fromAccountId: accounts[0]?.id || '' },
  });

  const watchAmount = watch('amount', 0);
  const watchFrom = watch('fromAccountId');
  const watchTo = watch('toRecipient');
  const fee = speeds.find((s) => s.id === selectedSpeed)?.fee || 0;
  const total = (watchAmount || 0) + fee;
  const fromAccount = accounts.find((a) => a.id === watchFrom);

  const onSubmit = async (data: TransferFormData) => {
    const res = await fetch('/api/transactions/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, transferSpeed: selectedSpeed }),
    });
    const result = await res.json();
    if (res.ok) {
      setTxDetails(result);
      setSuccessModal(true);
      reset();
    } else {
      alert(result.error || 'Transfer failed');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Transfer Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={labelCls}>From Account <span className="text-red-500">*</span></label>
              <select {...register('fromAccountId')} className={inputCls}>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_number} ({acc.account_type}) — ${acc.balance.toLocaleString()}
                  </option>
                ))}
              </select>
              {errors.fromAccountId && <p className="text-xs text-red-500 mt-1">{errors.fromAccountId.message}</p>}
            </div>

            <div>
              <label className={labelCls}>To Recipient (Account Number) <span className="text-red-500">*</span></label>
              <input
                {...register('toRecipient')}
                type="text"
                placeholder="Enter account number"
                className={`${inputCls} font-mono`}
              />
              {errors.toRecipient && <p className="text-xs text-red-500 mt-1">{errors.toRecipient.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Amount (USD) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium text-sm">$</span>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  type="number" step="0.01" min="0.01" placeholder="0.00"
                  className={`${inputCls} pl-7`}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Description (Optional)</label>
              <input
                {...register('description')}
                type="text"
                placeholder="What's this transfer for?"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Transfer Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {speeds.map(({ id, label, desc, fee: speedFee, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedSpeed(id as any)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      selectedSpeed === id
                        ? 'border-[#0066cc] bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <Icon size={18} className={selectedSpeed === id ? 'text-[#0066cc] dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'} />
                    <span className={`text-xs font-semibold ${selectedSpeed === id ? 'text-[#0066cc] dark:text-blue-400' : 'text-gray-600 dark:text-slate-300'}`}>{label}</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{desc}</span>
                    <span className={`text-xs font-bold ${speedFee > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {speedFee > 0 ? `$${speedFee}` : 'FREE'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <Send size={18} />}
              {isSubmitting ? 'Processing...' : 'Transfer Money'}
            </button>
          </form>
        </div>

        {/* Summary panel */}
        <div className="bg-linear-to-br from-[#0066cc] to-[#004499] rounded-xl p-6 text-white">
          <h2 className="text-lg font-bold mb-5">Transfer Summary</h2>

          <div className="space-y-4">
            {[
              { label: 'From',   value: fromAccount ? `${fromAccount.account_number} (${fromAccount.account_type})` : '—' },
              { label: 'To',     value: watchTo || '—' },
              { label: 'Amount', value: watchAmount ? `$${Number(watchAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
              { label: 'Fee',    value: fee > 0 ? `$${fee.toFixed(2)}` : 'FREE' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-blue-200 text-sm">{label}</span>
                <span className="text-white font-semibold text-sm">{value}</span>
              </div>
            ))}

            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
              <span className="text-white font-bold">Total</span>
              <span className="text-2xl font-bold">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="bg-white/10 rounded-xl p-3 text-sm">
              <p className="text-blue-100">Estimated Delivery</p>
              <p className="text-white font-semibold mt-0.5">
                {selectedSpeed === 'instant' ? 'Immediate' : selectedSpeed === 'standard' ? '1–2 hours' : '24 hours'}
              </p>
            </div>

            {fromAccount && (
              <div className="bg-white/10 rounded-xl p-3 text-sm">
                <p className="text-blue-100">Available Balance</p>
                <p className="text-white font-semibold mt-0.5">
                  ${fromAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={successModal} onClose={() => setSuccessModal(false)}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Money Sent Successfully!</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Your transfer has been processed.</p>
          {txDetails && (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 text-left space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Transaction ID</span>
                <span className="font-mono text-xs text-gray-700 dark:text-slate-300">{txDetails.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Date</span>
                <span className="text-gray-700 dark:text-slate-300">{new Date().toLocaleString()}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSuccessModal(false)}
            className="bg-[#0066cc] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#004499] transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  );
}
