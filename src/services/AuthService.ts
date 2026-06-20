/**
 * AuthService.ts — All Firebase Auth business logic lives here.
 *
 * Rules:
 *  - Import `auth` from firebase/firebase.ts, never re-initialize.
 *  - Every function has a try/catch that logs the Firebase error code.
 *  - React components NEVER call Firebase SDK methods directly.
 *
 * Chrome DevTools tip:
 *  - Filter the console by "[AuthService]" to isolate auth logs.
 *  - Network tab → filter "identitytoolkit" to see raw Auth API calls.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  UserCredential,
  Unsubscribe,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/firebase/firebase';

// ─── Type Exports ──────────────────────────────────────────────────────────────

export type { User };

export interface AuthResult {
  user: User | null;
  error: string | null;
}

// ─── Email / Password ──────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  try {
    const credential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    console.log('[AuthService] registerWithEmail: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] registerWithEmail: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { user: null, error: error.code };
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log('[AuthService] loginWithEmail: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] loginWithEmail: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { user: null, error: error.code };
  }
}

// ─── Google OAuth ──────────────────────────────────────────────────────────────

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const credential: UserCredential = await signInWithPopup(auth, provider);
    console.log('[AuthService] loginWithGoogle: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    // auth/popup-closed-by-user is expected UX, not an error worth logging loudly.
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error('[AuthService] loginWithGoogle: FAILED', {
        code: error.code,
        message: error.message,
      });
    }
    return { user: null, error: error.code };
  }
}

// ─── Sign Out ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<{ error: string | null }> {
  try {
    await signOut(auth);
    console.log('[AuthService] logout: success');
    return { error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] logout: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { error: error.code };
  }
}

// ─── Password Reset ────────────────────────────────────────────────────────────

export async function sendPasswordReset(
  email: string
): Promise<{ error: string | null }> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('[AuthService] sendPasswordReset: email sent to', email);
    return { error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] sendPasswordReset: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { error: error.code };
  }
}

// ─── Auth State Observer ───────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * Use this in AuthContext — do NOT call onAuthStateChanged in components.
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    console.log('[AuthService] auth state changed:', user ? `uid=${user.uid}` : 'signed out');
    callback(user);
  });
}
