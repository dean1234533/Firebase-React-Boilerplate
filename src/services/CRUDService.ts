/**
 * CRUDService.ts — Full CRUD + real-time subscription for users/{uid}/items.
 *
 * Rules:
 *  - subscribeToItems uses onSnapshot for live updates — call the returned
 *    unsubscribe function in your useEffect cleanup to avoid memory leaks.
 *  - All write functions (add, update, delete) wrap FirestoreService helpers.
 *  - Every function logs [CRUDService] + error.code on failure.
 *
 * Chrome DevTools tip:
 *  - Filter console by "[CRUDService]" to trace all item reads/writes.
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/firebase/firebase';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  ServiceResult,
} from '@/services/FirestoreService';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Item {
  id: string;
  text: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function itemsPath(uid: string): string {
  return `users/${uid}/items`;
}

// ─── Real-time Subscription ────────────────────────────────────────────────────

/**
 * Subscribes to the user's items collection in real time.
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 *
 * Usage:
 *   useEffect(() => {
 *     const unsub = subscribeToItems(uid, setItems, setError);
 *     return unsub;
 *   }, [uid]);
 */
export function subscribeToItems(
  uid: string,
  onData: (items: Item[]) => void,
  onError: (message: string) => void
): () => void {
  const ref = collection(db, itemsPath(uid));
  const q = query(ref, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Item[];
      console.log(`[CRUDService] subscribeToItems: ${items.length} items for uid=${uid}`);
      onData(items);
    },
    (err: FirestoreError) => {
      console.error('[CRUDService] subscribeToItems: FAILED', {
        code: err.code,
        message: err.message,
      });
      onError(`Failed to load items (${err.code})`);
    }
  );

  return unsubscribe;
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function addItem(
  uid: string,
  text: string
): Promise<ServiceResult<string>> {
  try {
    const result = await addDocument(itemsPath(uid), { text });
    console.log(`[CRUDService] addItem: created id=${result.data} for uid=${uid}`);
    return result;
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[CRUDService] addItem: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateItem(
  uid: string,
  itemId: string,
  text: string
): Promise<ServiceResult<null>> {
  try {
    const result = await updateDocument(itemsPath(uid), itemId, { text });
    console.log(`[CRUDService] updateItem: updated id=${itemId} for uid=${uid}`);
    return result;
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[CRUDService] updateItem: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteItem(
  uid: string,
  itemId: string
): Promise<ServiceResult<null>> {
  try {
    const result = await deleteDocument(itemsPath(uid), itemId);
    console.log(`[CRUDService] deleteItem: deleted id=${itemId} for uid=${uid}`);
    return result;
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[CRUDService] deleteItem: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}
