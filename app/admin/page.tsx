'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Analytics {
  totalUsers: number;
  totalTransactions: number;
  pendingKYC: number;
  pendingLoans: number;
  systemHealth: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAnalytics(d);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load analytics'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl"/>)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl p-6 text-center">
        <AlertCircle size={28} className="text-red-500 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        <p className="text-sm text-red-400 dark:text-red-500 mt-1">Make sure you have admin role and the schema is set up.</p>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: analytics?.totalUsers.toLocaleString(), icon: Users, color: 'text-[#0066cc] dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { title: 'Pending KYC', value: analytics?.pendingKYC.toString(), icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/50', badge: true },
    { title: 'Total Transactions', value: analytics?.totalTransactions.toLocaleString(), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { title: 'System Health', value: `${analytics?.systemHealth}%`, icon: Activity, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, color, bg, badge }) => (
          <div key={title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center relative`}>
                <Icon size={20} className={color} />
                {badge && Number(value) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {value}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #f3f4f6)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 8 }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#0066cc" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #f3f4f6)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: 8 }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Volume']}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/users',            label: 'Manage Users',   icon: '👥', desc: 'View and manage all users' },
          { href: '/admin/kyc-verification', label: 'KYC Approvals',  icon: '🪪', desc: `${analytics?.pendingKYC} pending reviews` },
          { href: '/admin/loans-approval',   label: 'Loan Approvals', icon: '💰', desc: `${analytics?.pendingLoans} pending loans` },
        ].map(({ href, label, icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm p-5 hover:shadow-md dark:hover:shadow-black/20 hover:border-[#0066cc] dark:hover:border-blue-600 transition-all group"
          >
            <div className="text-3xl mb-2">{icon}</div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#0066cc] dark:group-hover:text-blue-400">{label}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
