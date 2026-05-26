export const dynamic = 'force-dynamic';

import Sidebar from '@/components/common/Sidebar';
import TopNav from '@/components/common/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 pt-14 xl:pt-0 min-w-0 dashboard-main">
        <TopNav />
        <div className="px-4 sm:px-6 py-6">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl p-3 mb-4 flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400 text-sm font-semibold">Admin Panel</span>
            <span className="text-red-400 dark:text-red-500 text-xs">— Restricted access. All actions are logged.</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
