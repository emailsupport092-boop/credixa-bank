'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutGrid,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Landmark,
  Calculator,
  CreditCard,
  UserCheck,
  Settings2,
  LogOut,
  ChevronLeft,
  Menu,
  ShieldHalf,
  Users,
  BadgeCheck,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard',       label: 'Overview',     icon: LayoutGrid },
  { href: '/accounts',        label: 'Accounts',     icon: Wallet },
  { href: '/transfer',        label: 'Transfer',     icon: ArrowLeftRight },
  { href: '/transactions',    label: 'Transactions', icon: Receipt },
  { href: '/loans',           label: 'Loans',        icon: Landmark },
  { href: '/loan-calculator', label: 'Calculator',   icon: Calculator },
  { href: '/cards',           label: 'Cards',        icon: CreditCard },
  { href: '/kyc',             label: 'Verification', icon: UserCheck },
];

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 z-50 bg-gray-900 dark:bg-slate-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
      {label}
    </span>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 group
        ${active
          ? 'bg-[#0066cc] text-white shadow-md shadow-blue-500/20'
          : 'text-(--text-secondary) hover:bg-(--sidebar-hover) hover:text-foreground'
        }
      `}
    >
      <Icon size={18} className="shrink-0" strokeWidth={active ? 2.5 : 2} />
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && <Tooltip label={label} />}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  forceFull,
  onCollapse,
  showCollapseBtn,
}: {
  collapsed: boolean;
  forceFull?: boolean;
  onCollapse?: () => void;
  showCollapseBtn?: boolean;
}) {
  const show = !collapsed || !!forceFull;
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'U';

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo + collapse */}
      <div className={`flex items-center px-4 py-4 border-b border-(--sidebar-border) ${show ? 'justify-between' : 'justify-center'}`}>
        {show ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm leading-none">C</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Credixa</span>
          </Link>
        ) : (
          <Link href="/dashboard">
            <div className="w-8 h-8 bg-[#0066cc] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm leading-none">C</span>
            </div>
          </Link>
        )}
        {showCollapseBtn && (
          <button
            onClick={onCollapse}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-(--sidebar-hover) hover:text-foreground transition-colors"
          >
            <ChevronLeft size={15} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* User profile */}
      <div className={`px-3 py-3 border-b border-(--sidebar-border) ${!show ? 'flex justify-center' : ''}`}>
        {show ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-(--sidebar-hover) transition-colors cursor-default">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-[#0066cc]/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name || ''}`.trim()
                  : 'Loading...'}
              </p>
              <p className="text-xs text-(--text-muted) truncate mt-0.5">{user?.email || ''}</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#0066cc]/20">
            {initials}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={!show}
          />
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={`my-2 border-t border-(--sidebar-border) ${show ? 'mx-2' : ''}`} />
            {show && (
              <p className="px-3 pt-1 pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Administration
              </p>
            )}
            {[
              { href: '/admin',                  label: 'Overview',      icon: ShieldHalf },
              { href: '/admin/users',            label: 'Users',         icon: Users },
              { href: '/admin/kyc-verification', label: 'KYC Queue',     icon: BadgeCheck },
              { href: '/admin/loans-approval',   label: 'Loans',         icon: Landmark },
              { href: '/admin/cards',            label: 'Card Requests', icon: CreditCard },
            ].map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)}
                collapsed={!show}
              />
            ))}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 pt-2 border-t border-(--sidebar-border) space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-(--text-secondary) hover:bg-(--sidebar-hover) hover:text-foreground transition-all duration-150 group"
        >
          {theme === 'dark'
            ? <Sun size={18} className="shrink-0" strokeWidth={2} />
            : <Moon size={18} className="shrink-0" strokeWidth={2} />
          }
          {show && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          {!show && <Tooltip label={theme === 'dark' ? 'Light mode' : 'Dark mode'} />}
        </button>

        {/* Settings */}
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings2}
          active={pathname === '/settings'}
          collapsed={!show}
        />

        {/* Sign out */}
        <button
          onClick={signOut}
          className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-150 group"
        >
          <LogOut size={18} className="shrink-0" strokeWidth={2} />
          {show && <span>Sign Out</span>}
          {!show && <Tooltip label="Sign Out" />}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const check = () => {
      const c = window.innerWidth < 1280;
      setCollapsed(c);
      document.documentElement.style.setProperty('--sidebar-w', c ? '68px' : '240px');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="xl:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-(--sidebar-bg) border-b border-(--sidebar-border)">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0066cc] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs leading-none">C</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Credixa Bank</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-(--text-secondary) hover:bg-(--sidebar-hover) hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer — always full (forceFull) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="xl:hidden fixed top-0 left-0 bottom-0 w-64 z-40 bg-(--sidebar-bg) border-r border-(--sidebar-border) shadow-2xl"
          >
            <SidebarContent collapsed={false} forceFull />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden xl:flex flex-col fixed top-0 left-0 bottom-0 z-30
          bg-(--sidebar-bg) border-r border-(--sidebar-border)
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-60'}
        `}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => {
            const next = !collapsed;
            setCollapsed(next);
            document.documentElement.style.setProperty('--sidebar-w', next ? '68px' : '240px');
          }}
          showCollapseBtn
        />
      </aside>
    </>
  );
}
