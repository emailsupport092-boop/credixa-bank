'use client';

export const dynamic = 'force-dynamic';

import Sidebar from '@/components/common/Sidebar';
import TopNav from '@/components/common/TopNav';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0066cc]/20 border-t-[#0066cc] rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 pt-14 xl:pt-0 min-w-0 dashboard-main">
        <TopNav />
        <div className="px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
