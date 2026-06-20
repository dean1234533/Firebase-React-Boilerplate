/**
 * DashboardPage.tsx — Full CRUD dashboard with real-time Firestore sync.
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

  // ─── List state ─────────────────────────────────────────────────────────────
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ─── Add state ──────────────────────────────────────────────────────────────
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);

  // ─── Edit state ─────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // ─── Delete state ───────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Banner error ────────────────────────────────────────────────────────────
  const [actionError, setActionError] = useState<string | null>(null);

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
    if (error) {
      setActionError(`Failed to add item (${error})`);
    } else {
      setNewText('');
    }

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
    if (error) {
      setActionError(`Failed to save item (${error})`);
    } else {
      setEditingId(null);
      setEditText('');
    }

    setSavingId(null);
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(itemId: string) {
    if (!user) return;

    setDeletingId(itemId);
    setActionError(null);

    const { error } = await deleteItem(user.uid, itemId);
    if (error) {
      setActionError(`Failed to delete item (${error})`);
    }

    setDeletingId(null);
  }

  // ─── Sign out ────────────────────────────────────────────────────────────────
  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-red-500 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">

        {/* Action error banner */}
        {actionError && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {actionError}
          </div>
        )}

        {/* Add form */}
        <form onSubmit={handleAdd} className="mb-8 flex gap-2">
          <input
            type="text"
            placeholder="New item..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            disabled={adding}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={adding || !newText.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>

        {/* List */}
        {loadingItems ? (
          <p className="text-center text-sm text-gray-400">Loading...</p>
        ) : listError ? (
          <p className="text-center text-sm text-red-500">{listError}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No items yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isSaving = savingId === item.id;
              const isDeleting = deletingId === item.id;
              const isBusy = isSaving || isDeleting;

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                >
                  {isEditing ? (
                    // ── Edit mode ──────────────────────────────────────────────
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
                        className="flex-1 rounded-md border border-blue-400 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={isBusy || !editText.trim()}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-40"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isBusy}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    // ── Read mode ──────────────────────────────────────────────
                    <>
                      <span className="flex-1 text-sm text-gray-800">{item.text}</span>
                      <button
                        onClick={() => startEdit(item)}
                        disabled={isBusy}
                        className="text-xs font-medium text-blue-500 hover:text-blue-700 disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isBusy}
                        className="text-xs font-medium text-red-400 hover:text-red-600 disabled:opacity-40"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
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
