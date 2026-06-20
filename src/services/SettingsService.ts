/**
 * SettingsService.ts — User profile and account management.
 *
 * Rules:
 *  - Belongs to the optional Settings module. Deleting this file and
 *    SettingsPage.tsx leaves the rest of the app completely unaffected.
 *  - Calls Firebase Auth SDK directly (allowed in service files).
 *  - Mirrors the try/catch + [ServiceName] logging pattern of AuthService.ts.
 *
 * Chrome DevTools tip:
 *  - Filter console by "[SettingsService]" to trace profile/account operations.
 */

import { updateProfile, deleteUser } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { updateDocument, deleteDocument } from '@/services/FirestoreService';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SettingsResult {
  error: string | null;
}

// ─── Error Messages ────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  'auth/requires-recent-login': 'For security, please sign out and sign back in before deleting your account.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'not-found': 'Profile document not found. Sign out and sign back in.',
};

export function friendlySettingsError(code: string): string {
  return ERROR_MESSAGES[code] ?? `Something went wrong (${code})`;
}

// ─── Update Display Name ───────────────────────────────────────────────────────

/**
 * Updates the user's display name in both Firebase Auth and Firestore.
 * If the Firestore document doesn't exist yet (e.g. Google sign-in users
 * who haven't created a profile), the Auth update still succeeds.
 */
export async function updateDisplayName(
  user: User,
  displayName: string
): Promise<SettingsResult> {
  try {
    await updateProfile(user, { displayName });
    console.log('[SettingsService] updateDisplayName: Auth profile updated', { uid: user.uid });

    await updateDocument('users', user.uid, { displayName });
    console.log('[SettingsService] updateDisplayName: Firestore doc updated', { uid: user.uid });

    return { error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[SettingsService] updateDisplayName: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { error: error.code };
  }
}

// ─── Delete Account ────────────────────────────────────────────────────────────

/**
 * Permanently deletes the user's Firestore document then their Auth account.
 * Firestore subcollections (e.g. items) are NOT deleted client-side — use a
 * Firebase Cloud Function triggered on user deletion for full cleanup.
 *
 * Will fail with auth/requires-recent-login if the session is stale.
 * In that case, prompt the user to sign out and sign back in first.
 */
export async function deleteAccount(user: User): Promise<SettingsResult> {
  try {
    await deleteDocument('users', user.uid);
    console.log('[SettingsService] deleteAccount: Firestore doc deleted', { uid: user.uid });

    await deleteUser(user);
    console.log('[SettingsService] deleteAccount: Auth account deleted', { uid: user.uid });

    return { error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[SettingsService] deleteAccount: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { error: error.code };
  }
}
