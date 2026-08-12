'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Check, KeyRound, RefreshCw } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validators/auth';

const CODE_LENGTH = 6;

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

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [serverError, setServerError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [done, setDone] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    codeRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      const newDigits = [...digits];
      pasted.split('').forEach((ch, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = ch;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
      codeRefs.current[nextIndex]?.focus();
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError('');
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) { setServerError('Please enter all 6 digits'); return; }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password: data.password }),
    });
    const result = await res.json();
    if (!res.ok) {
      setServerError(result.error || 'Failed to reset password');
      if (result.attemptsRemaining !== undefined) setAttemptsLeft(result.attemptsRemaining);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  const handleResend = async () => {
    setResending(true);
    setServerError('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setDigits(Array(CODE_LENGTH).fill(''));
      setAttemptsLeft(3);
      setResendCooldown(60);
      codeRefs.current[0]?.focus();
    } else {
      const data = await res.json();
      setServerError(data.error || 'Failed to resend code');
    }
    setResending(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Password updated!</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Redirecting you to sign in...</p>
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

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
            Create a new<br />password.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Enter the code we sent you and choose a strong new password.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Code valid for 10 minutes',
            'Use 8+ characters, uppercase & numbers',
            'Never share your code or password',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm">
              <CheckCircle size={15} className="text-blue-300 shrink-0" />
              <span className="text-blue-100">{item}</span>
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

          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound size={22} className="text-[#0066cc]" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Reset your password</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter the 6-digit code sent to{' '}
            {email ? <span className="font-semibold text-gray-700">{email}</span> : 'your email address'}, then choose a new password.
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {serverError}
            </div>
          )}

          {attemptsLeft <= 2 && attemptsLeft > 0 && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3 mb-5">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Verification code</label>
              <div className="flex justify-between gap-2">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`
                      w-full aspect-square text-center text-xl font-bold rounded-xl border-2 transition-all
                      focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50
                      ${digit ? 'border-[#0066cc] bg-blue-50 text-[#0066cc]' : 'border-gray-200 bg-white text-gray-900'}
                    `}
                  />
                ))}
              </div>
              <div className="mt-2 text-right">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-gray-400">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center gap-1 text-xs text-[#0066cc] hover:text-[#004499] font-semibold disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                    {resending ? 'Sending...' : 'Resend code'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all pr-11"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || digits.join('').length !== CODE_LENGTH}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Update Password</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
