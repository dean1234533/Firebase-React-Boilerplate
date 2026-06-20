# AI_INTEGRATION.md — Adding Features with AI Tools

Paste the prompt below into Claude, Cursor, Copilot, or any AI assistant before describing a new feature. It gives the AI enough context to generate code that fits the existing architecture without breaking what's already working.

---

## How to Use

1. Open a new chat in your AI tool of choice
2. Paste the entire prompt below
3. On the last line ("Now here is the feature I want to add:"), describe your feature
4. The AI will generate service files, page updates, and Firestore rule additions in the correct locations

---

## The Prompt

---

You are working in a React + Firebase SaaS boilerplate with a strict layered architecture. Read all rules before writing any code.

**Stack:** React 18, TypeScript (strict), Vite, Firebase v11, Tailwind CSS v3 (Inter font), React Router v6, deployed on Vercel.

**Absolute rules — never break these:**

1. Firebase SDK is never imported in `pages/` or `components/`. All Firebase calls live exclusively in `src/services/`.

2. There is exactly one `initializeApp()` call in `src/firebase/firebase.ts`. Never create another. Import `auth` and `db` from that file.

3. Auth state is read via `const { user, loading, justSignedOut } = useAuth()` imported from `@/hooks/useAuth`. Never call `onAuthStateChanged` outside `src/context/AuthContext.tsx`.

4. Every function in `src/services/` must have a `try/catch` block. Every catch block must log `error.code` and `error.message` with a `[ServiceName]` prefix:
   ```ts
   console.error('[ServiceName] functionName: FAILED', { code: error.code, message: error.message });
   ```

5. All service functions must have explicit TypeScript return types. Use `FirebaseError` from `firebase/app` for error typing. No `any`.

6. New Firestore collections always get a corresponding rule in `firestore.rules` using `isOwner(userId)` and `hasOnlyFields([...])`. The default deny rule at the bottom is never removed. Never write `allow read, write: if true`.

7. For update rules, use `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` — not `hasOnlyFields()` — to check only the fields being changed, not the full document.

8. All files in `src/` are `.ts` or `.tsx`. No `.js` files.

9. Environment variables use `import.meta.env.VITE_*`. Never hardcode credentials.

**Folder structure:**
```
src/
├── firebase/firebase.ts          ← SDK init only. Exports: app, auth, db.
├── services/AuthService.ts       ← signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, subscribeToAuthState
├── services/FirestoreService.ts  ← getDocument, setDocument, addDocument, updateDocument, deleteDocument, queryCollection
├── services/CRUDService.ts       ← Domain service for users/{uid}/items — wraps FirestoreService helpers
├── context/AuthContext.tsx       ← Single onAuthStateChanged listener. Exposes user, loading, justSignedOut.
├── hooks/useAuth.ts              ← Re-exports useAuth from AuthContext
├── components/ProtectedRoute.tsx ← Redirects unauthenticated users to /auth
└── pages/
    ├── AuthPage.tsx              ← Login + Sign Up toggle
    └── DashboardPage.tsx         ← Protected CRUD dashboard
```

**Pattern to follow for any new Firestore-backed feature:**

**Step 1 — Create `src/services/[Domain]Service.ts`**
```ts
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/firebase/firebase';
import { addDocument, updateDocument, deleteDocument, ServiceResult } from '@/services/FirestoreService';

export interface Thing {
  id: string;
  name: string;
  createdAt: Timestamp | null;
}

function thingsPath(uid: string) { return `users/${uid}/things`; }

export function subscribeToThings(uid: string, onData: (items: Thing[]) => void, onError: (msg: string) => void) {
  const q = query(collection(db, thingsPath(uid)), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    (snap) => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Thing)),
    (err) => { console.error('[ThingService] subscribe: FAILED', { code: err.code }); onError(err.code); }
  );
}

export async function addThing(uid: string, name: string): Promise<ServiceResult<string>> {
  try {
    const result = await addDocument(thingsPath(uid), { name });
    console.log(`[ThingService] addThing: created ${result.data}`);
    return result;
  } catch (err) {
    const error = err as FirebaseError;
    console.error('[ThingService] addThing: FAILED', { code: error.code, message: error.message });
    return { data: null, error: error.code };
  }
}
```

**Step 2 — Use the service in a page (no Firebase imports)**
```ts
import { subscribeToThings, addThing } from '@/services/ThingService';
```

**Step 3 — Add Firestore rules above the default deny block**
```js
match /users/{userId}/things/{thingId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId) && hasOnlyFields(['name', 'createdAt']);
  allow update: if isOwner(userId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'updatedAt']);
  allow delete: if isOwner(userId);
}
```

**Step 4 — Deploy the rules**
```bash
firebase deploy --only firestore:rules
```

**What to reject if the AI generates it:**
- Any Firebase import inside `pages/` or `components/`
- A second `initializeApp()` call
- `allow read, write: if true` anywhere in `firestore.rules`
- `catch (err) { console.error(err) }` without logging `error.code`
- `useState` for auth state — always use `useAuth()`
- Hardcoded Firebase credentials

Now here is the feature I want to add:

---

## Tool-Specific Tips

**Claude / Claude Code**
Works best when you paste the full prompt first, then describe the feature in a follow-up message. Claude will generate the service file and page separately and respect the folder structure.

**Cursor**
Open the project in Cursor before starting so it indexes the existing files. Paste the prompt into the chat — Cursor will use `CRUDService.ts` as a reference when generating new service files.

**GitHub Copilot**
Paste the prompt as a comment block at the top of `src/services/` before the file you're creating. Copilot picks up the surrounding file context and will mimic the existing service patterns automatically.
