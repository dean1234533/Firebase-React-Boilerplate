/**
 * DashboardPage.tsx — Protected page showing the user's items list.
 * No Firebase SDK imports — all data ops go through CRUDService.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/AuthService';
import { getItems, addItem, deleteItem, Item } from '@/services/CRUDService';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch items on mount ───────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    async function fetchItems() {
      setLoadingItems(true);
      const { data, error: fetchError } = await getItems(user!.uid);
      if (fetchError) {
        setError(`Failed to load items (${fetchError})`);
      } else {
        setItems(data ?? []);
      }
      setLoadingItems(false);
    }

    fetchItems();
  }, [user]);

  // ─── Add item ───────────────────────────────────────────────────────────────

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!user || !newItemText.trim()) return;

    setAdding(true);
    setError(null);

    const { error: addError } = await addItem(user.uid, newItemText.trim());

    if (addError) {
      setError(`Failed to add item (${addError})`);
    } else {
      setNewItemText('');
      // Refresh list
      const { data } = await getItems(user.uid);
      setItems(data ?? []);
    }

    setAdding(false);
  }

  // ─── Delete item ────────────────────────────────────────────────────────────

  async function handleDelete(itemId: string) {
    if (!user) return;

    setDeletingId(itemId);
    setError(null);

    const { error: deleteError } = await deleteItem(user.uid, itemId);

    if (deleteError) {
      setError(`Failed to delete item (${deleteError})`);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    }

    setDeletingId(null);
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-10">

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Add item form */}
        <form onSubmit={handleAdd} className="mb-8 flex gap-2">
          <input
            type="text"
            placeholder="New item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            disabled={adding}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={adding || !newItemText.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>

        {/* Items list */}
        {loadingItems ? (
          <p className="text-center text-sm text-gray-400">Loading items...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No items yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
              >
                <span className="text-sm text-gray-800">{item.text}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="ml-4 text-xs font-medium text-red-400 hover:text-red-600 disabled:opacity-40"
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}

      </main>
    </div>
  );
}
