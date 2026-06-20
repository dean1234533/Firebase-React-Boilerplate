# AI_INTEGRATION.md — Using AI Assistants with This Boilerplate

This file contains a ready-to-use prompt for Claude, Cursor, Copilot, or any AI coding assistant. Paste it at the start of any session where you're adding features to this codebase. It gives the AI the context it needs to generate code that fits the architecture without breaking what already works.

---

## How to Use

1. Open a new chat in Claude, Cursor, or your AI assistant of choice
2. Paste the prompt below **before** describing the feature you want to build
3. Then describe your feature — the AI will place code in the right files automatically

---

## The Prompt

> Copy everything between the lines below.

---

You are working inside a React + Firebase boilerplate with a strict architecture. Read these rules before writing any code.

**Tech stack:** React 18, TypeScript (strict mode), Vite, Firebase v11, Tailwind CSS, React Router v6, deployed on Vercel.

**Folder structure:**
```
src/
├── firebase/firebase.ts          ← SDK init only. Exports: app, auth, db. No logic here.
├── services/AuthService.ts       ← All Firebase Auth calls
├── services/FirestoreService.ts  ← Generic Firestore CRUD helpers (getDocument, setDocument, addDocument, deleteDocument, queryCollection)
├── services/CRUDService.ts       ← Domain service for users/{uid}/items collection
├── context/AuthContext.tsx       ← Single onAuthStateChanged listener. Provides useAuth().
├── hooks/useAuth.ts              ← Re-exports useAuth from AuthContext
├── components/ProtectedRoute.tsx ← Route guard
└── pages/                        ← Page-level components only
```

**Mandatory rules you must follow:**

1. **Never import Firebase SDK in a React component or page.** No `import { getDoc } from 'firebase/firestore'` in `pages/` or `components/`. All Firebase calls go in `src/services/`.

2. **Never call `initializeApp()` again.** There is exactly one call in `src/firebase/firebase.ts`. Import `auth` and `db` from there.

3. **Every new service function must have a try/catch block** that logs `error.code` and `error.message` to the console using the prefix `[ServiceName]`. Example: `console.error('[NotesService] getNote: FAILED', { code: error.code, message: error.message })`.

4. **For a new Firestore collection**, create a new file at `src/services/[Domain]Service.ts`. Import and wrap the generic helpers from `FirestoreService.ts` — do not rewrite Firestore SDK calls from scratch.

5. **Auth state is read-only in components.** Use `const { user, loading } = useAuth()` imported from `@/hooks/useAuth`. Never call `onAuthStateChanged` outside `AuthContext.tsx`.

6. **All files must be `.ts` or `.tsx`.** No `.js` files in `src/`. Use explicit return types on all service functions. Use `FirebaseError` from `firebase/app` for error typing in catch blocks.

7. **When adding a new Firestore collection**, also add the corresponding security rule to `firestore.rules` using `isOwner(userId)` and `hasOnlyFields([...])`. Never write `allow read, write: if true`.

8. **New pages** go in `src/pages/`. If the page requires authentication, wrap it with `<ProtectedRoute>` in `App.tsx`.

9. **Environment variables** are prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`. Never hardcode Firebase credentials. Never add new secrets directly to code — add them to `.env.local` locally and to the Vercel dashboard for production.

**Pattern to follow when adding a new feature:**

Step 1 — Create `src/services/[Domain]Service.ts`:
```ts
import { queryCollection, addDocument, deleteDocument } from '@/services/FirestoreService';
import { FirebaseError } from 'firebase/app';
import { ServiceResult } from '@/services/FirestoreService';

export async function getThings(uid: string): Promise<ServiceResult<Thing[]>> {
  try {
    const result = await queryCollection<Thing>(`users/${uid}/things`, []);
    console.log(`[ThingService] getThings: fetched ${result.data?.length ?? 0} items`);
    return result;
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[ThingService] getThings: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}
```

Step 2 — Use the service in a page:
```ts
import { getThings } from '@/services/ThingService';
// No Firebase imports in this file.
```

Step 3 — Add a Firestore rule for the new collection above the default deny rule in `firestore.rules`:
```js
match /users/{userId}/things/{thingId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId) && hasOnlyFields(['name', 'createdAt']);
  allow delete: if isOwner(userId);
  allow update: if false;
}
```

Step 4 — Deploy the updated rules:
```bash
firebase deploy --only firestore:rules
```

Now here is the feature I want to add:

---

## Tips for Specific AI Tools

**Claude (claude.ai or Claude Code)**
Paste the prompt, then describe the feature. Claude will respect the file structure constraints and generate service files separately from component files.

**Cursor**
Open the project folder in Cursor first so it indexes the existing files. Then paste the prompt into the chat — Cursor will use the existing service files as reference when generating new ones.

**GitHub Copilot**
Paste the prompt as a comment block at the top of the file you're working in. Copilot uses surrounding context, so starting in the right file (`src/services/`) will guide it toward correct imports.

---

## What the AI Should Never Do

If the AI generates any of the following, reject it and remind it of the rules:

- `import { signInWithEmailAndPassword } from 'firebase/auth'` inside a component or page
- A second `initializeApp()` call anywhere
- `allow read, write: if true` in `firestore.rules`
- A catch block that only does `console.error(error)` without logging `error.code`
- A new `useState` to manage auth — always use `useAuth()`
- Hardcoded Firebase credentials instead of `import.meta.env.VITE_*`
