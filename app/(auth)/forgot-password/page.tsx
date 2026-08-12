'use client';

export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validators/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });
    // Always proceed — don't reveal whether the email exists
    router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
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
            Forgot your<br />password?
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            No worries — it happens. Enter your email and we&apos;ll send you a 6-digit reset code instantly.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Code expires in 10 minutes',
            'Max 3 verification attempts',
            'No account details required',
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

          <h1 className="text-3xl font-black text-gray-900 mb-1">Reset password</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter your email and we&apos;ll send you a 6-digit reset code.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 transition-all"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Mail size={16} /><span>Send Reset Code</span></>
              )}
            </button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mt-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
