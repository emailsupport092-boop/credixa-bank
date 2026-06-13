'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle, XCircle, Settings } from 'lucide-react';

interface Config {
  transfer_success_message: string;
  transfer_failure_message: string;
}

const DEFAULT_SUCCESS = 'Your transfer has been processed and credited to the recipient successfully.';
const DEFAULT_FAILURE = 'Your transaction could not be processed. Please contact support for assistance.';

const textareaCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 resize-none transition-colors';
const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<Config>({
    transfer_success_message: DEFAULT_SUCCESS,
    transfer_failure_message: DEFAULT_FAILURE,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          transfer_success_message: data.transfer_success_message || DEFAULT_SUCCESS,
          transfer_failure_message: data.transfer_failure_message || DEFAULT_FAILURE,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        showToast('success', 'Settings saved successfully.');
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Failed to save settings.');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-[#0066cc]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Configure system-wide messages shown to users during transactions.
        </p>
      </div>

      {/* Transfer Messages Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <Settings size={18} className="text-[#0066cc] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transfer Messages</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              These messages are shown to users on the transaction result screen.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success message */}
          <div>
            <label className={labelCls}>
              Success Message
              <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                — shown when a transaction is marked Completed
              </span>
            </label>
            <textarea
              rows={3}
              value={config.transfer_success_message}
              onChange={(e) => setConfig((c) => ({ ...c, transfer_success_message: e.target.value }))}
              placeholder={DEFAULT_SUCCESS}
              className={textareaCls}
            />
            {/* Live preview */}
            <div className="mt-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg px-4 py-2.5 flex items-start gap-2">
              <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                {config.transfer_success_message || DEFAULT_SUCCESS}
              </p>
            </div>
          </div>

          {/* Failure message */}
          <div>
            <label className={labelCls}>
              Failure Message
              <span className="ml-2 text-xs font-normal text-red-500 dark:text-red-400">
                — shown when a transaction is marked Failed
              </span>
            </label>
            <textarea
              rows={3}
              value={config.transfer_failure_message}
              onChange={(e) => setConfig((c) => ({ ...c, transfer_failure_message: e.target.value }))}
              placeholder={DEFAULT_FAILURE}
              className={textareaCls}
            />
            {/* Live preview */}
            <div className="mt-2 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-lg px-4 py-2.5 flex items-start gap-2">
              <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                {config.transfer_failure_message || DEFAULT_FAILURE}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <XCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
