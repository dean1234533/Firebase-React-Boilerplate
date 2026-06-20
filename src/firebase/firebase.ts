/**
 * firebase.ts — SDK initialization ONLY.
 *
 * Rules:
 *  - This file exports initialized Firebase service objects (app, auth, db).
 *  - It contains ZERO business logic. No queries, no auth calls, nothing.
 *  - All Firebase SDK calls happen in src/services/ — never import the SDK
 *    directly in React components.
 *
 * Chrome DevTools tip:
 *  - Open Application → IndexedDB → firebaseLocalStorageDb to inspect
 *    the persisted auth token in real time.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all env vars are present at startup. Fails loudly in dev.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  throw new Error(
    `[Firebase] Missing environment variables: ${missingKeys.join(', ')}. ` +
      'Copy .env.example → .env.local and fill in your project credentials.'
  );
}

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
