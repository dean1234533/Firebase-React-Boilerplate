/**
 * DashboardPage.tsx — Full CRUD dashboard with SaaS-grade UI.
 * No Firebase SDK imports — all data ops go through CRUDService.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/AuthService';
import {
  subscribeToItems,
  addItem,
  updateItem,
  deleteItem,
  Item,
} from '@/services/CRUDService';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Track any background activity for the global indicator
  const isBusyGlobal = adding || savingId !== null || deletingId !== null;

  // ─── Real-time subscription ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToItems(
      user.uid,
      (data) => {
        setItems(data);
        setLoadingItems(false);
      },
      (msg) => {
        setListError(msg);
        setLoadingItems(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // ─── Add ────────────────────────────────────────────────────────────────────
  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!user || !newText.trim()) return;
    setAdding(true);
    setActionError(null);
    const { error } = await addItem(user.uid, newText.trim());
    if (error) setActionError(`Failed to add item (${error})`);
    else setNewText('');
    setAdding(false);
  }

  // ─── Edit ────────────────────────────────────────────────────────────────────
  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditText(item.text);
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function handleSave(itemId: string) {
    if (!user || !editText.trim()) return;
    setSavingId(itemId);
    setActionError(null);
    const { error } = await updateItem(user.uid, itemId, editText.trim());
    if (error) setActionError(`Failed to save item (${error})`);
    else { setEditingId(null); setEditText(''); }
    setSavingId(null);
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(itemId: string) {
    if (!user) return;
    setDeletingId(itemId);
    setActionError(null);
    const { error } = await deleteItem(user.uid, itemId);
    if (error) setActionError(`Failed to delete item (${error})`);
    setDeletingId(null);
  }

  // ─── Sign out ────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await signOut();
    navigate('/auth', { replace: true });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <div className="h-3.5 w-3.5 rounded-sm bg-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">Starter Kit</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Global busy indicator */}
            {isBusyGlobal && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Spinner className="text-slate-400" />
                Saving…
              </div>
            )}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-slate-600">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">My Items</h2>
          <p className="mt-1 text-sm text-slate-500">
            {items.length > 0
              ? `${items.length} item${items.length === 1 ? '' : 's'}`
              : 'No items yet'}
          </p>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="mb-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <input
            type="text"
            placeholder="Add a new item..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            disabled={adding}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={adding || !newText.trim()}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50"
          >
            {adding ? <Spinner className="text-white/70" /> : (
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            )}
            {adding ? 'Adding…' : 'Add'}
          </button>
        </form>

        {/* List */}
        {loadingItems ? (
          <LoadingSkeleton />
        ) : listError ? (
          <ErrorState message={listError} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isSaving = savingId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <li
                  key={item.id}
                  className={`group flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all ${
                    isEditing
                      ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  {/* Drag handle dot */}
                  <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition group-hover:opacity-100">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-0.5 w-0.5 rounded-full bg-slate-400" />
                    ))}
                  </div>

                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={isSaving}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(item.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="flex-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={isSaving || !editText.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSaving && <Spinner className="text-white/70" />}
                        {isSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-slate-800">{item.text}</span>
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(item)}
                          disabled={isDeleting}
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          {isDeleting ? <Spinner className="text-red-400" /> : null}
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
        <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">No items yet</h3>
      <p className="text-sm text-slate-500">Create your first task to get started.</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <ul className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="h-14 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ))}
    </ul>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-600">{message}</p>
    </div>
  );
}
