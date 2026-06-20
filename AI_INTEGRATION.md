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

**Stack:** React 18, TypeScript (strict), Vite, Firebase v11, Tailwind CSS v3 (Inter font, `darkMode: 'class'`), React Router v6, Stripe, deployed on Vercel.

**Absolute rules — never break these:**

1. Firebase SDK is never imported in `pages/` or `components/`. All Firebase calls live exclusively in `src/services/`.

2. There is exactly one `initializeApp()` call in `src/firebase/firebase.ts`. Never create another. Import `auth` and `db` from that file.

3. Auth state is read via `const { user, loading, justSignedOut } = useAuth()` imported from `@/hooks/useAuth`. Never call `onAuthStateChanged` outside `src/context/AuthContext.tsx`.

4. Dark mode state is read via `const { theme, toggleTheme } = useTheme()` imported from `@/context/ThemeContext`. Never manage dark mode with local `useState`. Never add or remove the `dark` class manually — `ThemeContext` handles that.

5. Every function in `src/services/` must have a `try/catch` block. Every catch block must log `error.code` and `error.message` with a `[ServiceName]` prefix:
   ```ts
   console.error('[ServiceName] functionName: FAILED', { code: error.code, message: error.message });
   ```

6. All service functions must have explicit TypeScript return types. Use `FirebaseError` from `firebase/app` for error typing. No `any`.

7. New Firestore collections always get a corresponding rule in `firestore.rules` using `isOwner(userId)` and `hasOnlyFields([...])`. The default deny rule at the bottom is never removed. Never write `allow read, write: if true`.

8. For update rules, use `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` — not `hasOnlyFields()` — to check only the fields being changed, not the full document.

9. All files in `src/` are `.ts` or `.tsx`. No `.js` files.

10. Environment variables use `import.meta.env.VITE_*` for frontend. Server-side secrets (e.g. `STRIPE_SECRET_KEY`) live in `api/` only and are never imported in `src/`.

11. Stripe API calls go through Vercel serverless functions in `api/`. Never call Stripe directly from the frontend.

**Folder structure:**
```
src/
├── firebase/firebase.ts          ← SDK init only. Exports: app, auth, db.
├── services/AuthService.ts       ← signUpWithEmail, signInWithEmail, signInWithGoogle, signOut
├── services/FirestoreService.ts  ← getDocument, setDocument, addDocument, updateDocument, deleteDocument, queryCollection
├── services/CRUDService.ts       ← Domain service for users/{uid}/items — wraps FirestoreService helpers
├── services/SettingsService.ts   ← updateDisplayName, deleteAccount
├── services/StripeService.ts     ← redirectToCheckout (calls /api/create-checkout-session)
├── context/AuthContext.tsx       ← Single onAuthStateChanged listener. Exposes user, loading, justSignedOut.
├── context/ThemeContext.tsx      ← Dark mode toggle, persisted to localStorage. Exposes theme, toggleTheme.
├── hooks/useAuth.ts              ← Re-exports useAuth from AuthContext
├── components/ProtectedRoute.tsx ← Redirects unauthenticated users to /auth
└── pages/
    ├── AuthPage.tsx              ← Login + Sign Up toggle
    ├── DashboardPage.tsx         ← Protected CRUD dashboard
    ├── SettingsPage.tsx          ← Profile update + account deletion
    └── BillingPage.tsx           ← Stripe pricing page

api/
└── create-checkout-session.ts   ← Vercel serverless function (Stripe backend)
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

**Step 3 — Apply dark mode classes to every new page**

Every page must use `dark:` variants on background, text, borders, and inputs:
```tsx
import { useTheme } from '@/context/ThemeContext';

const { theme, toggleTheme } = useTheme();

// Page wrapper
<div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
// Header
<header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
// Text
<h1 className="text-slate-900 dark:text-white">
// Input
<input className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
```

**Step 4 — Add Firestore rules above the default deny block**
```js
match /users/{userId}/things/{thingId} {
  allow read:   if isOwner(userId);
  allow create: if isOwner(userId) && hasOnlyFields(['name', 'createdAt']);
  allow update: if isOwner(userId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'updatedAt']);
  allow delete: if isOwner(userId);
}
```

**Step 5 — Add the route to `src/App.tsx`**
```tsx
import { ThingPage } from '@/pages/ThingPage';

<Route
  path="/things"
  element={
    <ProtectedRoute>
      <ThingPage />
    </ProtectedRoute>
  }
/>
```

**What to reject if the AI generates it:**
- Any Firebase import inside `pages/` or `components/`
- A second `initializeApp()` call
- `allow read, write: if true` anywhere in `firestore.rules`
- `catch (err) { console.error(err) }` without logging `error.code`
- `useState` for auth state — always use `useAuth()`
- `useState` for dark mode — always use `useTheme()`
- Hardcoded Firebase or Stripe credentials
- Stripe secret key imported in any `src/` file

Now here is the feature I want to add:

---

## Tool-Specific Tips

**Claude / Claude Code**
Works best when you paste the full prompt first, then describe the feature in a follow-up message. Claude will generate the service file and page separately and respect the folder structure.

**Cursor**
Open the project in Cursor before starting so it indexes the existing files. Paste the prompt into the chat — Cursor will use `CRUDService.ts` as a reference when generating new service files.

**GitHub Copilot**
Paste the prompt as a comment block at the top of `src/services/` before the file you're creating. Copilot picks up the surrounding file context and will mimic the existing service patterns automatically.
