'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { Bell, Sun, Moon } from 'lucide-react';

export default function TopNav() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <header className="hidden xl:flex items-center justify-end gap-2 px-6 py-3 border-b border-(--sidebar-border) bg-(--bg-surface) sticky top-0 z-20">
      <button
        onClick={toggle}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-(--text-secondary) hover:bg-(--sidebar-hover) hover:text-foreground transition-colors"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button className="w-9 h-9 flex items-center justify-center rounded-xl text-(--text-secondary) hover:bg-(--sidebar-hover) hover:text-foreground transition-colors relative">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      <div className="flex items-center gap-2.5 pl-3 border-l border-(--sidebar-border)">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Loading...'}
          </p>
          <p className="text-xs text-(--text-muted) leading-tight">{user?.email || ''}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-[#0066cc]/20">
          {initials}
        </div>
      </div>
    </header>
  );
}
