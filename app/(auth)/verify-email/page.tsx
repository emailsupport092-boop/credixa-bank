'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    inputRefs.current[0]?.focus();
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
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) { setError('Please enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/email-verified');
    } else {
      setError(data.error || 'Verification failed');
      if (data.attemptsRemaining !== undefined) setAttemptsLeft(data.attemptsRemaining);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    const res = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setDigits(Array(CODE_LENGTH).fill(''));
      setAttemptsLeft(3);
      setResendCooldown(60);
      inputRefs.current[0]?.focus();
    } else {
      setError(data.error || 'Failed to resend code');
    }
    setResending(false);
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
            Almost there.<br />Confirm it&apos;s you.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            We sent a 6-digit code to your email. Enter it to activate your new account.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Code valid for 10 minutes',
            'Max 3 verification attempts',
            'No links to click, no waiting',
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
            <Mail size={22} className="text-[#0066cc]" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Verify your email</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter the 6-digit code sent to{' '}
            {email ? <span className="font-semibold text-gray-700">{email}</span> : 'your email address'}.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {attemptsLeft <= 2 && attemptsLeft > 0 && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm rounded-xl px-4 py-3 mb-5">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout
            </div>
          )}

          {/* Digit inputs */}
          <div className="flex justify-between gap-2 mb-6">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
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

          <p className="text-xs text-gray-400 text-center mb-5">
            Code expires in 10 minutes · Check your spam folder if not received
          </p>

          <button
            onClick={handleVerify}
            disabled={loading || digits.join('').length !== CODE_LENGTH}
            className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={16} /><span>Verify Email</span></>
            )}
          </button>

          <div className="mt-5 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend in <span className="font-semibold text-gray-600">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-sm text-[#0066cc] hover:text-[#004499] font-semibold disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                {resending ? 'Sending...' : "Didn't receive a code? Resend"}
              </button>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <a
              href="/login"
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
