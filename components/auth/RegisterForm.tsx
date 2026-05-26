'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Check, Mail, X } from 'lucide-react';
import { registerSchema, RegisterFormData } from '@/lib/validators/auth';

const perks = [
  'Free savings & current accounts',
  'Instant transfers worldwide',
  'Real-time crypto prices',
  'Email 2FA security',
  'Loan calculator & applications',
];

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
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => router.push('/login'), 4000);
    return () => clearTimeout(t);
  }, [showToast, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) { setServerError(result.error || 'Registration failed'); return; }
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 flex items-start gap-3 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3.5 max-w-sm animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={15} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">Check your inbox</p>
            <p className="text-xs text-gray-500 mt-0.5">Confirmation link sent. Redirecting to sign in…</p>
          </div>
          <button onClick={() => { setShowToast(false); router.push('/login'); }} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={14} />
          </button>
        </div>
      )}

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
            Your finances,<br />your way.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Open a free account in 2 minutes. No paperwork, no hidden fees.
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

          <h1 className="text-3xl font-black text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Already have one?{' '}
            <Link href="/login" className="text-[#0066cc] font-semibold hover:underline">Sign in</Link>
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([
                { name: 'first_name', label: 'First name', placeholder: 'John' },
                { name: 'last_name', label: 'Last name', placeholder: 'Doe' },
              ] as const).map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all"
                  />
                  {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
            >
              {isSubmitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight size={16} /></>
              }
            </button>

            <p className="text-xs text-gray-400 text-center pt-1">
              By creating an account you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">Terms of Service</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
