import Link from 'next/link';
import Image from 'next/image';
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
            <a href="#life" className="hover:text-gray-900 dark:hover:text-white transition-colors">Who it's for</a>
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
              Open an Account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/50 text-[#0066cc] dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#0066cc] dark:bg-blue-400 rounded-full animate-pulse" />
              Trusted by 50,000+ customers
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tight mb-6">
              Banking that works{' '}
              <span className="relative">
                <span className="relative z-10 text-[#0066cc] dark:text-blue-400">for you</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9C50 3 100 1 150 3C200 5 250 8 298 6" stroke="#0066cc" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
              </span>
            </h1>

            <p className="text-xl text-gray-500 dark:text-slate-400 max-w-xl mb-8 leading-relaxed">
              Send money instantly, grow your savings, access credit — all in one secure
              account built for everyday life.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 bg-[#0066cc] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#004499] transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40 active:scale-[0.98] text-base"
              >
                Open Free Account
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-semibold px-8 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-base"
              >
                Sign In
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 dark:text-slate-500">
              {['No hidden fees', 'Bank-grade security', 'Instant transfers', 'FDIC insured'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#0066cc] dark:text-blue-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero photo */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 dark:shadow-black/40 aspect-4/5">
              <Image
                src="/images/landing/hero-payment.jpg"
                alt="A Credixa customer paying with her card at a small business counter"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            {/* Floating stat card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-gray-200 dark:shadow-black/40 border border-gray-100 dark:border-slate-800 p-4 w-56">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center">
                  <CheckCircle size={15} className="text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">Payment sent</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">$42.50</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">To Riverside Coffee Co.</p>
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

      {/* ── REAL LIFE / WHO IT'S FOR ── */}
      <section id="life" className="py-24 px-6 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0066cc] dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Real people, real banking</p>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white">Built for whatever you're working toward</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                img: '/images/landing/business-owners.jpg',
                alt: 'Two small business partners reviewing finances together on a laptop',
                title: 'Small business owners',
                desc: 'Separate accounts, fast payouts, and tools to keep cash flow simple.',
              },
              {
                img: '/images/landing/milestone-family.jpg',
                alt: 'Colleagues celebrating a milestone in the office',
                title: 'Big milestones',
                desc: 'From your first loan to your first home — we help you get there.',
              },
              {
                img: '/images/landing/students.jpg',
                alt: 'Students studying together and managing their budget',
                title: 'Students & young savers',
                desc: 'Fee-free accounts and budgeting tools built for getting started.',
              },
            ].map(({ img, alt, title, desc }) => (
              <div key={title} className="group">
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 mb-4">
                  <Image
                    src={img}
                    alt={alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
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
              { step: '01', title: 'Tell us about you', desc: 'Share your personal details so we can open an account in your name.' },
              { step: '02', title: 'Get your account number', desc: 'Your account is created instantly with its own dedicated account number.' },
              { step: '03', title: 'Verify to unlock more', desc: 'Upload an ID document to unlock higher limits — usually within 24 hours.' },
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
            <div className="relative grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-10 items-center">
              <div>
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
              <div className="relative hidden md:block rounded-2xl overflow-hidden aspect-square shadow-2xl">
                <Image
                  src="/images/landing/handshake.jpg"
                  alt="Two people shaking hands after opening an account"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
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
