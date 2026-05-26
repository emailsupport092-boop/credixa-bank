'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EmailVerifiedPage() {
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
            You're all<br />set!
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed">
            Your email has been confirmed. Sign in to start managing your finances.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Bank-grade 256-bit encryption',
            'Real-time transaction alerts',
            'Instant global transfers',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm">
              <CheckCircle size={15} className="text-blue-300 shrink-0" />
              <span className="text-blue-100">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Credixa Bank</span>
          </div>

          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Email confirmed!</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Your account is now active. Sign in to access your dashboard and start banking.
          </p>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
          >
            Sign In to Your Account <ArrowRight size={16} />
          </Link>

          <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-gray-400">
            <ShieldCheck size={13} />
            <span>Your account is secured and ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
