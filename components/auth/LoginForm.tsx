'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, LoginFormData } from '@/lib/validators/auth';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [twoFAStep, setTwoFAStep] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setServerError('Invalid email or password. Please try again.');
      return;
    }

    if (!authData.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      const resendRes = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      if (resendRes.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        setServerError('Please verify your email first. We were unable to send a new code — try again shortly.');
      }
      return;
    }

    const checkRes = await fetch('/api/auth/check-2fa', { method: 'POST' });
    const checkData = await checkRes.json();

    if (!checkRes.ok) {
      setServerError(checkData.error || 'Login failed');
      await supabase.auth.signOut();
      return;
    }

    if (checkData.requires_2fa) {
      setTwoFAStep(true);
      setTimeout(() => router.push('/verify-otp'), 1200);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  if (twoFAStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-[#0066cc]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-500 text-sm mt-2">A 6-digit code was sent. Redirecting...</p>
          <div className="mt-5 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0066cc] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/2 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">C</span>
            </div>
            <span className="text-white font-bold text-xl">Credixa Bank</span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back.<br />Good to see you.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Sign in to manage your accounts, transfer money, and track your finances.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Bank-grade 256-bit encryption',
            'Email 2FA on every login',
            'Real-time transaction alerts',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm">
              <CheckCircle size={15} className="text-blue-300 shrink-0" />
              <span className="text-blue-100">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Credixa Bank</span>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            New here?{' '}
            <Link href="/register" className="text-[#0066cc] font-semibold hover:underline">
              Create a free account
            </Link>
          </p>

          {urlError && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3 mb-5">
              {decodeURIComponent(urlError)}
            </div>
          )}

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#0066cc] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
            >
              {isSubmitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Continue</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
