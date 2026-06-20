/**
 * CRUDService.ts — Domain service for the user's "items" collection.
 *
 * Rules:
 *  - Wraps generic FirestoreService helpers — never calls Firestore SDK directly.
 *  - Collection path: users/{uid}/items/{itemId}
 *  - Every function has try/catch and logs [CRUDService] + error.code on failure.
 *
 * Chrome DevTools tip:
 *  - Filter console by "[CRUDService]" to isolate item read/write logs.
 */

import { orderBy, Timestamp } from 'firebase/firestore';
import {
  queryCollection,
  addDocument,
  deleteDocument,
  ServiceResult,
} from '@/services/FirestoreService';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Item {
  id: string;
  text: string;
  createdAt: Timestamp | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function itemsPath(uid: string): string {
  return `users/${uid}/items`;
}

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getItems(uid: string): Promise<ServiceResult<Item[]>> {
  try {
    const result = await queryCollection<Item>(itemsPath(uid), [
      orderBy('createdAt', 'desc'),
    ]);
    console.log(`[CRUDService] getItems: fetched ${result.data?.length ?? 0} items for uid=${uid}`);
    return result;
  } catch (err) {
    const error = err as { code: string; message: string };
    console.error('[CRUDService] getItems: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
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
    const error = err as { code: string; message: string };
    console.error('[CRUDService] addItem: FAILED', { code: error.code, message: error.message });
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
    const error = err as { code: string; message: string };
    console.error('[CRUDService] deleteItem: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}
