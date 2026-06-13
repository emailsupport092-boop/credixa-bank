'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account } from '@/types';
import { bankTransferSchema, BankTransferFormData } from '@/lib/validators/auth';
import {
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Lock,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface Props {
  accounts: Account[];
}

type Step = 'form' | 'confirm' | 'loading' | 'success' | 'error';

interface BeneficiaryLookup {
  beneficiary_name: string;
  bank_name: string;
  bank_address: string;
  swift_code?: string;
  routing_number: string;
  currency: string;
}

interface TransferResult {
  transactionId: string;
  reference: string;
  beneficiaryName: string;
  bankName: string;
  beneficiaryAccountNumber: string;
  amount: number;
  createdAt: string;
  successMessage?: string;
  errorMessage?: string;
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-colors';
const lockedInputCls =
  'w-full px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-sm text-gray-900 dark:text-white cursor-not-allowed';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}

export default function TransferForm({ accounts }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [lookup, setLookup] = useState<BeneficiaryLookup | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [pollElapsed, setPollElapsed] = useState(0);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStart = useRef<number>(0);
  const pendingTransactionId = useRef<string | null>(null);
  const formDataRef = useRef<BankTransferFormData | null>(null);
  const transferPayload = useRef<Omit<TransferResult, 'successMessage' | 'errorMessage'> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BankTransferFormData>({
    resolver: zodResolver(bankTransferSchema),
    defaultValues: { fromAccountId: accounts[0]?.id || '' },
  });

  const watchAccountNumber = watch('beneficiaryAccountNumber');
  const watchAmount = watch('amount');
  const watchFrom = watch('fromAccountId');
  const fromAccount = accounts.find((a) => a.id === watchFrom);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  // Auto-lookup when account number changes
  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);

    const acct = watchAccountNumber?.trim();
    if (!acct || acct.length < 4) {
      setLookup(null);
      setLookupStatus('idle');
      return;
    }

    setLookupStatus('loading');
    lookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/beneficiary-accounts/${encodeURIComponent(acct)}`);
        if (res.ok) {
          const data: BeneficiaryLookup = await res.json();
          setLookup(data);
          setLookupStatus('found');
          setValue('beneficiaryName', data.beneficiary_name, { shouldValidate: true });
          setValue('bankName', data.bank_name, { shouldValidate: true });
          setValue('bankAddress', data.bank_address, { shouldValidate: true });
          setValue('swiftCode', data.swift_code || '', { shouldValidate: true });
          setValue('routingNumber', data.routing_number, { shouldValidate: true });
        } else {
          setLookup(null);
          setLookupStatus('not-found');
          setValue('beneficiaryName', '');
          setValue('bankName', '');
          setValue('bankAddress', '');
          setValue('swiftCode', '');
          setValue('routingNumber', '');
        }
      } catch {
        setLookup(null);
        setLookupStatus('not-found');
      }
    }, 600);

    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [watchAccountNumber, setValue]);

  function startPolling(transactionId: string) {
    pendingTransactionId.current = transactionId;
    pollStart.current = Date.now();
    setPollElapsed(0);

    pollTimer.current = setInterval(async () => {
      const elapsed = Date.now() - pollStart.current;
      setPollElapsed(elapsed);

      if (elapsed >= POLL_TIMEOUT_MS) {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setErrorMsg('Transaction is taking longer than expected. Please check your transaction history.');
        setStep('error');
        return;
      }

      try {
        const res = await fetch(`/api/transactions/${transactionId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'completed') {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setResult((prev) => ({
            ...prev!,
            successMessage: data.success_message || undefined,
          }));
          setStep('success');
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setErrorMsg(data.error_message || 'Your transaction could not be processed. Please contact support.');
          setStep('error');
        }
        // still 'pending' — keep polling
      } catch {
        // network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS);
  }

  async function sendOTP() {
    setOtpSending(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp/send-transfer', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send code');
      } else {
        setOtpSent(true);
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpSending(false);
    }
  }

  function onFormSubmit(data: BankTransferFormData) {
    formDataRef.current = data;
    setStep('confirm');
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    sendOTP();
  }

  async function onConfirm() {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit code');
      return;
    }
    setConfirming(true);
    setOtpError('');

    const verifyRes = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: otp }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      setOtpError(verifyData.error || 'Invalid code');
      setConfirming(false);
      return;
    }

    setStep('loading');
    setConfirming(false);

    try {
      const fd = formDataRef.current!;
      const transferRes = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: fd.fromAccountId,
          beneficiaryAccountNumber: fd.beneficiaryAccountNumber,
          beneficiaryName: fd.beneficiaryName,
          bankName: fd.bankName,
          bankAddress: fd.bankAddress,
          amount: fd.amount,
          purpose: fd.purpose,
          swiftCode: fd.swiftCode,
          routingNumber: fd.routingNumber,
        }),
      });

      const transferData = await transferRes.json();

      if (!transferRes.ok) {
        setErrorMsg(transferData.error || 'Transfer failed. Please try again.');
        setStep('error');
        return;
      }

      // Store base result; poll will update the messages once admin acts
      const baseResult: TransferResult = {
        transactionId: transferData.transactionId,
        reference: transferData.reference,
        beneficiaryName: transferData.beneficiaryName,
        bankName: transferData.bankName,
        beneficiaryAccountNumber: transferData.beneficiaryAccountNumber,
        amount: transferData.amount,
        createdAt: new Date().toISOString(),
      };
      setResult(baseResult);
      transferPayload.current = baseResult;

      // Start polling — loading screen waits for admin to act
      startPolling(transferData.transactionId);
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
      setStep('error');
    }
  }

  function handleReset() {
    if (pollTimer.current) clearInterval(pollTimer.current);
    reset();
    setStep('form');
    setLookup(null);
    setLookupStatus('idle');
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setResult(null);
    setErrorMsg('');
    setPollElapsed(0);
    pendingTransactionId.current = null;
    formDataRef.current = null;
    transferPayload.current = null;
  }

  // ── Step: Loading ──────────────────────────────────────────────
  if (step === 'loading') {
    const minutesLeft = Math.max(0, Math.floor((POLL_TIMEOUT_MS - pollElapsed) / 60000));
    const isLong = pollElapsed > 15000;

    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-md mx-auto text-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-950" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0066cc] animate-spin" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Processing Transaction</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Please wait while your transaction is being processed.
          </p>
        </div>
        <div className="w-64 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-[#0066cc] rounded-full animate-pulse w-3/4" />
        </div>
        {isLong && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <Clock size={15} className="shrink-0" />
            <span>This is taking a little longer. Please keep this page open. (~{minutesLeft} min remaining)</span>
          </div>
        )}
        {result && (
          <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">Ref: {result.reference}</p>
        )}
      </div>
    );
  }

  // ── Step: Success ──────────────────────────────────────────────
  if (step === 'success' && result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden" id="receipt">
          <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Transaction Successful</h2>
            <p className="text-emerald-100 text-sm mt-1">
              {result.successMessage || 'Your transfer has been processed successfully.'}
            </p>
          </div>

          <div className="p-6 space-y-0.5">
            <DetailRow label="Transaction ID" value={result.reference} />
            <DetailRow label="Recipient Name" value={result.beneficiaryName} />
            <DetailRow label="Bank Name" value={result.bankName} />
            <DetailRow label="Account Number" value={result.beneficiaryAccountNumber} />
            <DetailRow
              label="Amount Sent"
              value={`$${Number(result.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            />
            <DetailRow
              label="Date & Time"
              value={new Date(result.createdAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
          </div>

          <div className="p-6 pt-2 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer size={16} />
              Print Receipt
            </button>
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              New Transfer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Error ────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="bg-linear-to-br from-red-500 to-red-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Transaction Failed</h2>
            <p className="text-red-100 text-sm mt-1">We were unable to process your transfer.</p>
          </div>
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Error Details</p>
              <p className="text-sm text-red-600 dark:text-red-300">{errorMsg}</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              <ArrowLeft size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Confirmation ─────────────────────────────────────────
  if (step === 'confirm') {
    const fd = formDataRef.current!;
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="bg-linear-to-br from-[#0066cc] to-[#004499] p-6 text-center">
            <ShieldCheck size={32} className="text-white mx-auto mb-2" />
            <h2 className="text-xl font-bold text-white">Confirm Transfer</h2>
            <p className="text-blue-200 text-sm mt-1">Review the details before confirming.</p>
          </div>

          <div className="p-6 space-y-0.5">
            <DetailRow label="From Account" value={fromAccount ? `${fromAccount.account_number} (${fromAccount.account_type})` : fd.fromAccountId} />
            <DetailRow label="Beneficiary Account" value={fd.beneficiaryAccountNumber} />
            <DetailRow label="Beneficiary Name" value={fd.beneficiaryName} />
            <DetailRow label="Bank Name" value={fd.bankName} />
            <DetailRow label="Bank Address" value={fd.bankAddress} />
            <DetailRow
              label="Amount"
              value={`$${Number(fd.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            />
            <DetailRow label="Purpose" value={fd.purpose} />
            {fd.swiftCode && <DetailRow label="Swift Code" value={fd.swiftCode} />}
            <DetailRow label="Routing Number" value={fd.routingNumber} />
          </div>

          <div className="px-6 pb-6 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
              <p className="text-sm text-[#0066cc] dark:text-blue-400 font-medium">
                {otpSent
                  ? 'A 6-digit authorization code has been sent to your registered email address.'
                  : otpSending
                  ? 'Sending authorization code to your email…'
                  : 'Requesting authorization code…'}
              </p>
            </div>

            <div>
              <label className={labelCls}>Enter OTP <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                className={`${inputCls} font-mono tracking-widest text-center text-xl`}
              />
              {otpError && <p className="text-xs text-red-500 mt-1">{otpError}</p>}
            </div>

            <button
              type="button"
              onClick={sendOTP}
              disabled={otpSending}
              className="text-xs text-[#0066cc] dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {otpSending ? 'Resending…' : 'Resend code'}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('form')}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming || otp.length < 6}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {confirming ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {confirming ? 'Verifying…' : 'Confirm'}
          </button>
        </div>
      </div>
    );
  }

  // ── Step: Form ─────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Transfer Details</h2>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
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
            <label className={labelCls}>Beneficiary Account Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                {...register('beneficiaryAccountNumber')}
                type="text"
                placeholder="Enter account number"
                className={`${inputCls} font-mono pr-10`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {lookupStatus === 'loading' && <Loader2 size={16} className="animate-spin text-gray-400" />}
                {lookupStatus === 'found' && <CheckCircle size={16} className="text-emerald-500" />}
                {lookupStatus === 'not-found' && <Search size={16} className="text-gray-400" />}
              </div>
            </div>
            {lookupStatus === 'found' && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <Lock size={11} /> Account verified — details auto-filled
              </p>
            )}
            {lookupStatus === 'not-found' && (watchAccountNumber?.length ?? 0) >= 4 && (
              <p className="text-xs text-gray-400 mt-1">Account not in registry — fill details manually</p>
            )}
            {errors.beneficiaryAccountNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.beneficiaryAccountNumber.message}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Beneficiary Name <span className="text-red-500">*</span></label>
            {lookup ? (
              <div className="relative">
                <input value={lookup.beneficiary_name} readOnly className={lockedInputCls} />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            ) : (
              <input {...register('beneficiaryName')} type="text" placeholder="Full name on account" className={inputCls} />
            )}
            {errors.beneficiaryName && <p className="text-xs text-red-500 mt-1">{errors.beneficiaryName.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Bank Name <span className="text-red-500">*</span></label>
            {lookup ? (
              <div className="relative">
                <input value={lookup.bank_name} readOnly className={lockedInputCls} />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            ) : (
              <input {...register('bankName')} type="text" placeholder="e.g. Chase Bank" className={inputCls} />
            )}
            {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Bank Address <span className="text-red-500">*</span></label>
            {lookup ? (
              <div className="relative">
                <input value={lookup.bank_address} readOnly className={lockedInputCls} />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            ) : (
              <input {...register('bankAddress')} type="text" placeholder="123 Main St, New York, NY" className={inputCls} />
            )}
            {errors.bankAddress && <p className="text-xs text-red-500 mt-1">{errors.bankAddress.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Amount (USD) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium text-sm">$</span>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={`${inputCls} pl-7`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Purpose of Payment <span className="text-red-500">*</span></label>
            <input {...register('purpose')} type="text" placeholder="e.g. Invoice payment, Family support" className={inputCls} />
            {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Swift Code <span className="text-gray-400 font-normal">(Optional)</span></label>
            {lookup ? (
              <div className="relative">
                <input value={lookup.swift_code || '—'} readOnly className={lockedInputCls} />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            ) : (
              <input {...register('swiftCode')} type="text" placeholder="e.g. CHASUS33" className={`${inputCls} font-mono uppercase`} />
            )}
          </div>

          <div>
            <label className={labelCls}>Routing Number <span className="text-red-500">*</span></label>
            {lookup ? (
              <div className="relative">
                <input value={lookup.routing_number} readOnly className={lockedInputCls} />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            ) : (
              <input {...register('routingNumber')} type="text" placeholder="e.g. 021000021" className={`${inputCls} font-mono`} />
            )}
            {errors.routingNumber && <p className="text-xs text-red-500 mt-1">{errors.routingNumber.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
          >
            <Send size={18} />
            Transfer
          </button>
        </form>
      </div>

      {/* Summary Panel */}
      <div className="bg-linear-to-br from-[#0066cc] to-[#004499] rounded-xl p-6 text-white h-fit">
        <h2 className="text-lg font-bold mb-5">Transfer Summary</h2>
        <div className="space-y-4">
          {[
            { label: 'From', value: fromAccount ? `${fromAccount.account_number} (${fromAccount.account_type})` : '—' },
            { label: 'Beneficiary Account', value: watchAccountNumber || '—' },
            { label: 'Beneficiary Name', value: lookup?.beneficiary_name || '—' },
            { label: 'Bank', value: lookup?.bank_name || '—' },
            {
              label: 'Amount',
              value: watchAmount
                ? `$${Number(watchAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '$0.00',
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-blue-200 text-sm">{label}</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ))}

          <div className="border-t border-white/20 pt-3 flex justify-between items-center">
            <span className="text-white font-bold">Total</span>
            <span className="text-2xl font-bold">
              ${watchAmount
                ? Number(watchAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })
                : '0.00'}
            </span>
          </div>

          {fromAccount && (
            <div className="bg-white/10 rounded-xl p-3 text-sm">
              <p className="text-blue-100">Available Balance</p>
              <p className="text-white font-semibold mt-0.5">
                ${fromAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {lookup && (
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 text-sm">
              <p className="text-emerald-200 font-medium">Account Verified</p>
              <p className="text-white text-xs mt-0.5">Details locked from registry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
