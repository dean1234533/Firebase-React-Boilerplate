/**
 * SettingsPage.tsx — User profile and account management.
 * No Firebase SDK imports — all calls go through SettingsService.
 *
 * Self-contained module. Removing this file and SettingsService.ts
 * leaves the rest of the app unaffected.
 */

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  updateDisplayName,
  deleteAccount,
  friendlySettingsError,
} from '@/services/SettingsService';

export function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  // ─── Update display name ──────────────────────────────────────────────────

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    if (!user || !displayName.trim()) return;

    setSavingName(true);
    setNameError(null);
    setNameSuccess(false);

    const { error } = await updateDisplayName(user, displayName.trim());

    if (error) {
      setNameError(friendlySettingsError(error));
    } else {
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }

    setSavingName(false);
  }

  // ─── Delete account ───────────────────────────────────────────────────────

  async function handleDeleteAccount() {
    if (!user || confirmText !== 'DELETE') return;

    setDeletingAccount(true);
    setDeleteError(null);

    const { error } = await deleteAccount(user);

    if (error) {
      setDeleteError(friendlySettingsError(error));
      setDeletingAccount(false);
    } else {
      navigate('/auth', { replace: true });
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">Settings</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden text-sm text-slate-600 sm:block">{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">

        {/* Page title */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your profile and account preferences.</p>
        </div>

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-800">Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your display name.</p>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Email — read only */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
                <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                  Read only
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Email cannot be changed from this panel.</p>
            </div>

            {/* Display name */}
            <form onSubmit={handleSaveName}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Display name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  disabled={savingName}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={savingName || !displayName.trim()}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingName && <Spinner className="text-white/70" />}
                  {savingName ? 'Saving…' : 'Save'}
                </button>
              </div>

              {nameSuccess && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Display name updated successfully.
                </p>
              )}
              {nameError && (
                <p className="mt-2 text-sm text-red-600">{nameError}</p>
              )}
            </form>

          </div>
        </div>

        {/* ── Danger Zone Card ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="border-b border-red-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
            <p className="text-xs text-red-500 mt-0.5">These actions are permanent and cannot be undone.</p>
          </div>

          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-sm font-medium text-slate-800">Delete account</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button
              onClick={() => { setShowDeleteModal(true); setDeleteError(null); setConfirmText(''); }}
              className="shrink-0 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete Account
            </button>
          </div>
        </div>

      </main>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

            <div className="px-6 pt-6 pb-4">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">Delete your account?</h3>
              <p className="text-sm text-slate-500 mb-4">
                This will permanently delete your account and profile. Your items will remain in Firestore until cleaned up by the server.
                <strong className="text-slate-700"> This cannot be undone.</strong>
              </p>

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20"
              />

              {deleteError && (
                <p className="mt-2 text-sm text-red-600">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || deletingAccount}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingAccount && <Spinner className="text-white/70" />}
                {deletingAccount ? 'Deleting…' : 'Delete Account'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-3.5 w-3.5 animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
