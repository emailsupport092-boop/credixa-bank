'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, User, IdCard,
} from 'lucide-react';
import {
  registerAccountSchema, registerDetailsSchema,
  RegisterAccountFormData, RegisterDetailsFormData,
} from '@/lib/validators/auth';

const perks = [
  'Free savings & current accounts',
  'Instant transfers worldwide',
  'Real-time crypto prices',
  'Email 2FA security',
  'Loan calculator & applications',
];

const inputCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

type Step = 'account' | 'details';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {checks.map(({ label, pass }) => (
        <div key={label} className={`flex items-center gap-1 text-xs ${pass ? 'text-emerald-600' : 'text-gray-400'}`}>
          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${pass ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
            {pass && <Check size={8} className="text-white" strokeWidth={3} />}
          </div>
          {label}
        </div>
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const [step, setStep] = useState<Step>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const accountForm = useForm<RegisterAccountFormData>({
    resolver: zodResolver(registerAccountSchema),
  });
  const detailsForm = useForm<RegisterDetailsFormData>({
    resolver: zodResolver(registerDetailsSchema),
  });

  const password = accountForm.watch('password', '');

  const onAccountSubmit = () => {
    setServerError('');
    setStep('details');
  };

  const onDetailsSubmit = async (details: RegisterDetailsFormData) => {
    setServerError('');
    const account = accountForm.getValues();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...account, ...details }),
    });
    const result = await res.json();
    if (!res.ok) {
      setServerError(result.error || 'Registration failed');
      setStep('account');
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(account.email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0066cc] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">C</span>
            </div>
            <span className="text-white font-bold text-xl">Credixa Bank</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Open your account,<br />the right way.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            A couple of details is all it takes to open a real account with a dedicated
            account number — no paperwork, no branch visits.
          </p>
        </div>

        <div className="relative space-y-2.5">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">What you get for free</p>
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2.5 text-sm">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-blue-100">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Credixa Bank</span>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Open an account</h1>
          <p className="text-gray-500 text-sm mb-6">
            Already have one?{' '}
            <Link href="/login" className="text-[#0066cc] font-semibold hover:underline">Sign in</Link>
          </p>

          {/* Step indicator */}
          <div className="flex items-center mb-7">
            {[
              { n: 'account' as Step, label: 'Your details', icon: User },
              { n: 'details' as Step, label: 'Personal info', icon: IdCard },
            ].map(({ n, label, icon: Icon }, i) => {
              const order: Step[] = ['account', 'details'];
              const active = order.indexOf(step) >= i;
              const current = step === n;
              return (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      active && !current ? 'bg-emerald-500 text-white' :
                      current ? 'bg-[#0066cc] text-white ring-4 ring-blue-100' :
                                'bg-gray-100 text-gray-400'
                    }`}>
                      {active && !current ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${current ? 'text-[#0066cc]' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-5 transition-colors ${active && step === 'details' ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'account' && (
              <motion.form
                key="account"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={accountForm.handleSubmit(onAccountSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { name: 'first_name', label: 'First name', placeholder: 'John' },
                    { name: 'last_name', label: 'Last name', placeholder: 'Doe' },
                  ] as const).map(({ name, label, placeholder }) => (
                    <div key={name}>
                      <label className={labelCls}>{label}</label>
                      <input {...accountForm.register(name)} placeholder={placeholder} className={inputCls} />
                      {accountForm.formState.errors[name] && (
                        <p className="text-xs text-red-500 mt-1">{accountForm.formState.errors[name]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className={labelCls}>Email address</label>
                  <input {...accountForm.register('email')} type="email" placeholder="you@example.com" className={inputCls} />
                  {accountForm.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1.5">{accountForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input
                      {...accountForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className={`${inputCls} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                  {accountForm.formState.errors.password && (
                    <p className="text-xs text-red-500 mt-1.5">{accountForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </motion.form>
            )}

            {step === 'details' && (
              <motion.form
                key="details"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}
                className="space-y-4"
              >
                <p className="text-xs text-gray-500 -mt-1 mb-1">
                  Required to open a bank account in your name.
                </p>

                <div>
                  <label className={labelCls}>Date of birth</label>
                  <input {...detailsForm.register('date_of_birth')} type="date" className={`${inputCls} [color-scheme:auto]`} />
                  {detailsForm.formState.errors.date_of_birth && (
                    <p className="text-xs text-red-500 mt-1">{detailsForm.formState.errors.date_of_birth.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Nationality</label>
                  <input {...detailsForm.register('nationality')} placeholder="United States" className={inputCls} />
                  {detailsForm.formState.errors.nationality && (
                    <p className="text-xs text-red-500 mt-1">{detailsForm.formState.errors.nationality.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Phone number</label>
                  <input {...detailsForm.register('phone')} type="tel" placeholder="+1 (555) 000-0000" className={inputCls} />
                  {detailsForm.formState.errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{detailsForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Residential address</label>
                  <input {...detailsForm.register('address')} placeholder="123 Main St, New York, NY 10001" className={inputCls} />
                  {detailsForm.formState.errors.address && (
                    <p className="text-xs text-red-500 mt-1">{detailsForm.formState.errors.address.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('account')}
                    className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={detailsForm.formState.isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
                  >
                    {detailsForm.formState.isSubmitting
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Open Account<ArrowRight size={16} /></>
                    }
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  By opening an account you agree to our{' '}
                  <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
