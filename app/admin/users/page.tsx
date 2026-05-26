'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Search, Eye, ShieldAlert, Trash2, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const kycBadge: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  submitted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  verified:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  rejected:  'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

const statusBadge: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  suspended: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  inactive:  'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function UserDrawer({ user, onClose, onUpdate, onDelete }: {
  user: User;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<User>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [role, setRole] = useState(user.role);
  const [status, setStatus] = useState(user.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(user.id, { role, status });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await onDelete(user.id);
    onClose();
  };

  const initials = [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const changed = role !== user.role || status !== user.status;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-sm flex flex-col shadow-2xl" style={{ background: 'var(--bg-surface)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>User Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--sidebar-hover) transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#0066cc] to-[#004499] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'User ID', value: user.id.slice(0, 8) + '…' },
              { label: 'Joined', value: format(new Date(user.created_at), 'MMM d, yyyy') },
              { label: 'KYC Status', value: user.kyc_status },
              { label: 'Two-Factor', value: (user as any).two_factor_enabled ? 'Enabled' : 'Disabled' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'var(--bg-surface-2)' }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as User['role'])}
                className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none pr-8 focus:outline-none focus:border-[#0066cc]"
                style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Account Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['active', 'suspended', 'inactive'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    status === s
                      ? 'bg-[#0066cc] text-white border-[#0066cc]'
                      : 'border-(--border-color) hover:border-[#0066cc]'
                  }`}
                  style={status !== s ? { color: 'var(--text-secondary)', background: 'var(--bg-surface-2)' } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
          {changed && (
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-2.5 bg-[#0066cc] hover:bg-[#004499] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all border ${
              confirmDelete
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/40'
            }`}
          >
            {deleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete User'}
          </button>
          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} className="w-full py-1.5 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [toast, setToast] = useState('');

  const load = () =>
    fetch('/api/admin/users').then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdate = async (id: string, updates: Partial<User>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...updates } : u));
      setSelected((prev) => prev ? { ...prev, ...updates } : prev);
      showToast('User updated successfully');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted');
    }
  };

  const filtered = users.filter((u) =>
    !search || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold dark:text-white" style={{ color: 'var(--text-primary)' }}>User Management</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{users.length} total users</p>
      </div>

      {/* Search */}
      <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:border-[#0066cc]"
            style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-2)' }} />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface-2)' }}>
                  {['User', 'Email', 'KYC', 'Role', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-(--sidebar-hover)" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${kycBadge[user.kyc_status]}`}>
                        {user.kyc_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[user.status] || statusBadge.inactive}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(user)}
                          className="p-1.5 rounded-lg hover:bg-(--sidebar-hover) transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          title="View / Edit"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleUpdate(user.id, { status: user.status === 'suspended' ? 'active' : 'suspended' })}
                          className={`p-1.5 rounded-lg transition-colors ${user.status === 'suspended' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                          title={user.status === 'suspended' ? 'Unblock' : 'Block'}
                        >
                          <ShieldAlert size={15} />
                        </button>
                        <button
                          onClick={() => setSelected(user)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
}
