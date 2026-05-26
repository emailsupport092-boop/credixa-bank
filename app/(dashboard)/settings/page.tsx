'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, ShieldOff, Bell, User, Lock, CheckCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useAuth();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('users').select('two_factor_enabled').eq('id', user.id).single()
      .then(({ data }) => { if (data) setTwoFAEnabled(data.two_factor_enabled ?? false); });
  }, [user?.id]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggle2FA = async () => {
    setToggling(true);
    const newValue = !twoFAEnabled;
    const res = await fetch('/api/auth/2fa/toggle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newValue }),
    });
    const data = await res.json();
    if (res.ok) {
      setTwoFAEnabled(newValue);
      showToast(newValue ? '2FA enabled.' : '2FA disabled.', 'success');
    } else {
      showToast(data.error || 'Failed to update 2FA', 'error');
    }
    setToggling(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Password updated successfully!', 'success');
      setNewPassword('');
      setShowPwForm(false);
    }
    setPwLoading(false);
  };

  const card = "bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden";
  const hdr  = "flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          >
            <CheckCircle size={16} />{toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Manage your account preferences and security</p>
      </div>

      {/* Security */}
      <div className={card}>
        <div className={hdr}>
          <Lock size={18} className="text-[#0066cc] dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
          {/* 2FA */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${twoFAEnabled ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-slate-700'}`}>
                  {twoFAEnabled
                    ? <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
                    : <ShieldOff size={20} className="text-gray-400 dark:text-slate-500" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    {twoFAEnabled && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 max-w-sm">
                    {twoFAEnabled ? 'A 6-digit code is emailed to you on every sign-in.' : "Add an extra layer of security. You'll receive an email code each time you log in."}
                  </p>
                  {twoFAEnabled && (
                    <div className="mt-3 space-y-1.5">
                      {['Email OTP sent on every login', 'Codes expire after 10 minutes', 'Max 3 attempts before lockout'].map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                          <CheckCircle size={12} className="text-emerald-500 dark:text-emerald-400" />{p}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleToggle2FA} disabled={toggling} className="shrink-0 mt-0.5">
                <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${twoFAEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'} ${toggling ? 'opacity-60' : ''}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${twoFAEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Change password — inline form, no redirect */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-gray-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Password</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Change your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPwForm(!showPwForm)}
                className="text-sm font-medium text-[#0066cc] dark:text-blue-400 hover:text-[#004499] dark:hover:text-blue-300 transition-colors"
              >
                {showPwForm ? 'Cancel' : 'Change →'}
              </button>
            </div>

            <AnimatePresence>
              {showPwForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }} onSubmit={handleChangePassword} className="mt-4 overflow-hidden"
                >
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-3 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="submit" disabled={pwLoading || newPassword.length < 8}
                    className="mt-3 flex items-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                  >
                    {pwLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><ArrowRight size={14} /><span>Update Password</span></>
                    }
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className={card}>
        <div className={hdr}>
          <User size={18} className="text-[#0066cc] dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Account Info</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Full Name', value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Account Status', value: user?.status || '—' },
            { label: 'KYC Status', value: user?.kyc_status || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-slate-400">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className={card}>
        <div className={hdr}>
          <Bell size={18} className="text-[#0066cc] dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
          {[
            { label: 'Transaction alerts', desc: 'Email on every send/receive', on: true },
            { label: 'Loan updates', desc: 'Status changes on your loans', on: true },
            { label: 'Security alerts', desc: 'Login from new device or location', on: true },
            { label: 'KYC updates', desc: 'Verification status changes', on: true },
          ].map(({ label, desc, on }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full ${on ? 'bg-[#0066cc]' : 'bg-gray-300 dark:bg-slate-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm ${on ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
