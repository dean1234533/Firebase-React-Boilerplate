/**
 * FirestoreService.ts — Generic Firestore CRUD template.
 *
 * Rules:
 *  - All Firestore SDK calls live here, never in components.
 *  - Every function logs the Firebase error code on failure.
 *  - Add domain-specific services (e.g. UserService, PostService) that
 *    import and wrap these helpers.
 *
 * Chrome DevTools tip:
 *  - Filter console by "[FirestoreService]" to trace reads/writes.
 *  - Network tab → filter "firestore.googleapis.com" for raw requests.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  FirestoreError,
  WithFieldValue,
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

// ─── Document Operations ───────────────────────────────────────────────────────

export async function getDocument<T = DocumentData>(
  collectionPath: string,
  docId: string
): Promise<ServiceResult<T>> {
  try {
    const ref = doc(db, collectionPath, docId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn(`[FirestoreService] getDocument: no doc at ${collectionPath}/${docId}`);
      return { data: null, error: 'not-found' };
    }

    console.log(`[FirestoreService] getDocument: fetched ${collectionPath}/${docId}`);
    return { data: snap.data() as T, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] getDocument: FAILED', {
      path: `${collectionPath}/${docId}`,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

export async function setDocument<T extends WithFieldValue<DocumentData>>(
  collectionPath: string,
  docId: string,
  data: T,
  merge = true
): Promise<ServiceResult<null>> {
  try {
    const ref = doc(db, collectionPath, docId);
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge });
    console.log(`[FirestoreService] setDocument: wrote ${collectionPath}/${docId}`);
    return { data: null, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] setDocument: FAILED', {
      path: `${collectionPath}/${docId}`,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<ServiceResult<null>> {
  try {
    const ref = doc(db, collectionPath, docId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    console.log(`[FirestoreService] updateDocument: updated ${collectionPath}/${docId}`);
    return { data: null, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] updateDocument: FAILED', {
      path: `${collectionPath}/${docId}`,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

export async function deleteDocument(
  collectionPath: string,
  docId: string
): Promise<ServiceResult<null>> {
  try {
    const ref = doc(db, collectionPath, docId);
    await deleteDoc(ref);
    console.log(`[FirestoreService] deleteDocument: deleted ${collectionPath}/${docId}`);
    return { data: null, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] deleteDocument: FAILED', {
      path: `${collectionPath}/${docId}`,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

// ─── Collection Operations ─────────────────────────────────────────────────────

export async function addDocument<T extends WithFieldValue<DocumentData>>(
  collectionPath: string,
  data: T
): Promise<ServiceResult<string>> {
  try {
    const ref = collection(db, collectionPath);
    const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp() });
    console.log(`[FirestoreService] addDocument: created ${collectionPath}/${docRef.id}`);
    return { data: docRef.id, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] addDocument: FAILED', {
      collection: collectionPath,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

export async function queryCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[]
): Promise<ServiceResult<T[]>> {
  try {
    const ref = collection(db, collectionPath);
    const q = query(ref, ...constraints);
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
    console.log(`[FirestoreService] queryCollection: ${results.length} docs from ${collectionPath}`);
    return { data: results, error: null };
  } catch (err) {
    const error = err as FirestoreError;
    console.error('[FirestoreService] queryCollection: FAILED', {
      collection: collectionPath,
      code: error.code,
      message: error.message,
    });
    return { data: null, error: error.code };
  }
}

// Re-export `where` so callers don't need to import Firestore directly.
export { where };
