'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save, Search, Loader2 } from 'lucide-react';

interface BeneficiaryAccount {
  id: string;
  account_number: string;
  beneficiary_name: string;
  bank_name: string;
  bank_address: string;
  swift_code?: string;
  routing_number: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  account_number: '',
  beneficiary_name: '',
  bank_name: '',
  bank_address: '',
  swift_code: '',
  routing_number: '',
  currency: 'USD',
};

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20';
const labelCls = 'block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1';

export default function BeneficiaryAccountsPage() {
  const [accounts, setAccounts] = useState<BeneficiaryAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchAccounts(q = search) {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (q) params.set('search', q);
    const res = await fetch(`/api/admin/beneficiary-accounts?${params}`);
    const data = await res.json();
    setAccounts(data.accounts || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  useEffect(() => { fetchAccounts(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(acc: BeneficiaryAccount) {
    setEditingId(acc.id);
    setForm({
      account_number: acc.account_number,
      beneficiary_name: acc.beneficiary_name,
      bank_name: acc.bank_name,
      bank_address: acc.bank_address,
      swift_code: acc.swift_code || '',
      routing_number: acc.routing_number,
      currency: acc.currency,
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.account_number || !form.beneficiary_name || !form.bank_name || !form.bank_address || !form.routing_number) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');

    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch('/api/admin/beneficiary-accounts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || 'Save failed');
    } else {
      setShowForm(false);
      fetchAccounts();
    }
    setSaving(false);
  }

  async function handleToggle(acc: BeneficiaryAccount) {
    await fetch('/api/admin/beneficiary-accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: acc.id, is_active: !acc.is_active }),
    });
    fetchAccounts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this beneficiary account? This cannot be undone.')) return;
    setDeletingId(id);
    await fetch(`/api/admin/beneficiary-accounts?id=${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchAccounts();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchAccounts(search);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Beneficiary Accounts</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{total} registered account{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#004499] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by account number, name or bank…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0066cc]"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-[#0066cc] text-white rounded-xl text-sm font-semibold hover:bg-[#004499] transition-colors">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#0066cc]" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 dark:text-slate-500">No beneficiary accounts found.</p>
            <button onClick={openCreate} className="mt-3 text-sm text-[#0066cc] hover:underline">
              Add the first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  {['Account Number', 'Beneficiary Name', 'Bank', 'Routing No.', 'Currency', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-gray-900 dark:text-white font-medium">
                      {acc.account_number}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-slate-300">{acc.beneficiary_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-700 dark:text-slate-300">{acc.bank_name}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[180px]">{acc.bank_address}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600 dark:text-slate-400">{acc.routing_number}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-slate-400">{acc.currency}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggle(acc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          acc.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                        }`}
                      >
                        {acc.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {acc.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(acc)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors text-gray-500 dark:text-slate-400"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deletingId === acc.id}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-red-400"
                          title="Delete"
                        >
                          {deletingId === acc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Edit Beneficiary Account' : 'Add Beneficiary Account'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Account Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.account_number}
                    onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
                    placeholder="e.g. 1234567890"
                    className={`${inputCls} font-mono`}
                    readOnly={!!editingId}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Beneficiary Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.beneficiary_name}
                    onChange={(e) => setForm((f) => ({ ...f, beneficiary_name: e.target.value }))}
                    placeholder="Full legal name"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Bank Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                    placeholder="e.g. Chase Bank"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Bank Address <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.bank_address}
                    onChange={(e) => setForm((f) => ({ ...f, bank_address: e.target.value }))}
                    placeholder="123 Main St, New York, NY 10001"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Swift Code <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={form.swift_code}
                    onChange={(e) => setForm((f) => ({ ...f, swift_code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. CHASUS33"
                    className={`${inputCls} font-mono uppercase`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Routing Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.routing_number}
                    onChange={(e) => setForm((f) => ({ ...f, routing_number: e.target.value }))}
                    placeholder="e.g. 021000021"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className={inputCls}
                  >
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'GHS'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{formError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066cc] hover:bg-[#004499] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving…' : 'Save Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
