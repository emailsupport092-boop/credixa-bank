import Link from 'next/link';
import {
  ArrowRight, Shield, Zap, Globe, TrendingUp, CreditCard,
  Lock, CheckCircle, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Credixa</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-slate-400">
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-gray-900 dark:hover:text-white transition-colors">Security</a>
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-[#0066cc] dark:hover:text-[#4d9fff] transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#0066cc] text-white px-4 py-2 rounded-xl hover:bg-[#004499] transition-all active:scale-[0.98] shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-linear-to-b from-blue-50 dark:from-blue-950/30 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-40 left-0 w-56 h-56 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/50 text-[#0066cc] dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-[#0066cc] dark:bg-blue-400 rounded-full animate-pulse" />
            Trusted by 50,000+ customers
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6">
            Banking that works{' '}
            <span className="relative">
              <span className="relative z-10 text-[#0066cc] dark:text-blue-400">for you</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9C50 3 100 1 150 3C200 5 250 8 298 6" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Send money instantly, grow your savings, access credit — all in one secure platform
            built for the modern world.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-[#0066cc] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#004499] transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 active:scale-[0.98] text-base"
            >
              Open Free Account
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-semibold px-8 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-base"
            >
              Sign In
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400 dark:text-slate-500">
            {['No hidden fees', 'Bank-grade security', 'Instant transfers', 'FDIC insured'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#0066cc] dark:text-blue-400" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-gray-200 dark:shadow-black/40 border border-gray-100 dark:border-slate-800 overflow-hidden p-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Total Balance', value: '$45,000', color: 'border-[#0066cc]' },
                { label: 'Monthly Spending', value: '$1,200', color: 'border-emerald-500' },
                { label: 'Available', value: '$53,800', color: 'border-amber-400' },
              ].map((c) => (
                <div key={c.label} className={`bg-gray-50 dark:bg-slate-800 rounded-xl p-3 border-l-4 ${c.color}`}>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{c.label}</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{c.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0066cc]/10 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} className="text-[#0066cc] dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">BTC/USD</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Bitcoin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">$67,420</p>
                <p className="text-xs text-emerald-500 font-semibold">+2.4%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0066cc] py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '$2.4B+', label: 'Transactions processed' },
            { value: '50K+', label: 'Active customers' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '2 min', label: 'Average approval time' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black">{value}</p>
              <p className="text-blue-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0066cc] dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Powerful banking features</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-3 max-w-lg mx-auto">
              One platform for all your financial needs — from everyday transactions to investment accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: 'Instant Transfers', desc: 'Send money to anyone in seconds. Instant, standard, and economy transfer speeds available.', color: 'bg-blue-50 dark:bg-blue-950/50 text-[#0066cc] dark:text-blue-400' },
              { icon: TrendingUp, title: 'Live Crypto Prices', desc: 'Track Bitcoin, Ethereum, and Cardano prices in real-time directly from your dashboard.', color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400' },
              { icon: CreditCard, title: 'Virtual & Physical Cards', desc: 'Request Visa or Mastercard cards linked to any of your accounts. Freeze instantly.', color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' },
              { icon: Globe, title: 'Multi-currency Accounts', desc: 'Open savings, current, and investment accounts in multiple currencies.', color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' },
              { icon: Shield, title: '2FA Security', desc: 'Email-based two-factor authentication on every login. Your account stays protected.', color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' },
              { icon: Lock, title: 'Flexible Loans', desc: 'Apply for loans up to $500K. Use our real-time calculator to estimate repayments.', color: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 hover:shadow-lg dark:hover:shadow-black/30 hover:border-gray-200 dark:hover:border-slate-700 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0066cc] dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Get started in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-[#0066cc]/30 via-[#0066cc] to-[#0066cc]/30" />
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up in under 2 minutes. No paperwork, no branch visits required.' },
              { step: '02', title: 'Verify Identity', desc: 'Complete a quick KYC check. Upload your ID and get verified in 24 hours.' },
              { step: '03', title: 'Start Banking', desc: 'Send money, apply for loans, track crypto — all in one dashboard.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-14 h-14 bg-[#0066cc] text-white rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-4 shadow-md shadow-blue-200 dark:shadow-blue-900/40">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" className="py-24 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-[#0066cc] to-[#002266] rounded-3xl p-10 md:p-14 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-300" />
                <span className="text-blue-200 font-semibold text-sm uppercase tracking-widest">Security first</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Your money is safe with us</h2>
              <p className="text-blue-200 max-w-xl mb-8 text-lg">
                We use bank-grade encryption, two-factor authentication, and Row-Level Security to ensure only you can access your account.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['256-bit AES encryption', 'Email 2FA on every login', 'Row-Level Security (RLS)', 'JWT token authentication', 'HTTPS enforced everywhere', 'Real-time fraud monitoring'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    <span className="text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8 text-lg">
            Join thousands of customers who trust Credixa Bank for their daily banking.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#0066cc] text-white font-bold px-10 py-4 rounded-2xl hover:bg-[#004499] transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 active:scale-[0.98] text-base"
          >
            Open Your Free Account
            <ArrowRight size={18} />
          </Link>
          <p className="text-gray-400 dark:text-slate-600 text-sm mt-4">No credit card required · Free forever</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0066cc] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Credixa Bank</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-slate-600 text-center">
            © {new Date().getFullYear()} Credixa Bank. Built with Next.js & Supabase.
          </p>
          <div className="flex gap-5 text-sm text-gray-500 dark:text-slate-500">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
