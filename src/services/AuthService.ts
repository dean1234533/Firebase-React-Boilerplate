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
  signOut as firebaseSignOut,
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

// ─── Error Messages ────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found':        'No account found with that email.',
  'auth/wrong-password':        'Incorrect password.',
  'auth/invalid-email':         'Please enter a valid email address.',
  'auth/email-already-in-use':  'An account with this email already exists.',
  'auth/weak-password':         'Password must be at least 6 characters.',
  'auth/too-many-requests':     'Too many attempts. Please try again later.',
  'auth/invalid-credential':    'Invalid email or password.',
  'auth/network-request-failed':'Network error. Check your connection.',
};

export function friendlyError(code: string): string {
  return ERROR_MESSAGES[code] ?? `Authentication error (${code})`;
}

// ─── Sign Up ───────────────────────────────────────────────────────────────────

export async function signUpWithEmail(
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

    console.log('[AuthService] signUpWithEmail: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] signUpWithEmail: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { user: null, error: error.code };
  }
}

// ─── Sign In ───────────────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log('[AuthService] signInWithEmail: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] signInWithEmail: FAILED', {
      code: error.code,
      message: error.message,
    });
    return { user: null, error: error.code };
  }
}

// ─── Google OAuth ──────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const credential: UserCredential = await signInWithPopup(auth, provider);
    console.log('[AuthService] signInWithGoogle: success', { uid: credential.user.uid });
    return { user: credential.user, error: null };
  } catch (err) {
    const error = err as FirebaseError;
    if (error.code !== 'auth/popup-closed-by-user') {
      console.error('[AuthService] signInWithGoogle: FAILED', {
        code: error.code,
        message: error.message,
      });
    }
    return { user: null, error: error.code };
  }
}

// ─── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOut(): Promise<{ error: string | null }> {
  try {
    await firebaseSignOut(auth);
    console.log('[AuthService] signOut: success');
    return { error: null };
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[AuthService] signOut: FAILED', {
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

export function subscribeToAuthState(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    console.log('[AuthService] auth state changed:', user ? `uid=${user.uid}` : 'signed out');
    callback(user);
  });
}
