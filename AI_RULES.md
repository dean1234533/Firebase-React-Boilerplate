# AI_RULES.md — Architecture Contract for AI Agents

This file governs how all AI agents (Claude, Copilot, Cursor, etc.) must interact
with this codebase. Read it before touching any file.

---

## Folder Structure

```
src/
├── firebase/
│   └── firebase.ts          ← SDK init ONLY. No logic. No queries.
├── services/
│   ├── AuthService.ts       ← All Firebase Auth calls
│   ├── FirestoreService.ts  ← Generic Firestore CRUD helpers
│   └── CRUDService.ts       ← Domain service: users/{uid}/items CRUD
├── context/
│   └── AuthContext.tsx      ← Global auth state (onAuthStateChanged listener)
├── hooks/
│   └── useAuth.ts           ← Re-exports useAuth from AuthContext
├── components/
│   └── ProtectedRoute.tsx   ← Route guard wrapper
└── pages/
    ├── LoginPage.tsx
    └── DashboardPage.tsx
```

---

## Mandatory Rules

### 1. Separation of Concerns (ENFORCED)
- `firebase/firebase.ts` exports ONLY initialized service objects (`auth`, `db`, `app`).
- ALL Firebase SDK function calls (`signIn`, `getDoc`, `setDoc`, etc.) MUST live in `src/services/`.
- React components MUST NOT import from `firebase/auth` or `firebase/firestore` directly.
- If you need new Firebase functionality, add it to the appropriate service file.

### 2. Error Handling (ENFORCED)
- Every function in `src/services/` MUST have a `try/catch` block.
- Every `catch` block MUST log `error.code` and `error.message` to the console.
- Use the prefix `[ServiceName]` in all console logs (e.g., `[AuthService]`, `[FirestoreService]`).
- Console logs MUST include structured data: `{ code, message, context }` — not just a string.

### 3. Auth State (ENFORCED)
- There is ONE place that calls `onAuthStateChanged`: `AuthContext.tsx`.
- All components access auth state via `useAuth()` from `@/hooks/useAuth`.
- Do NOT call `subscribeToAuthState` or `onAuthStateChanged` anywhere else.

### 4. Security (ENFORCED)
- `firestore.rules` uses the principle of least privilege.
- Default rule at the bottom of `firestore.rules` is `allow read, write: if false`.
- New collections MUST be explicitly allowed — never remove the default deny rule.
- Do NOT use `allow read, write: if true` in any rule.

### 5. TypeScript (ENFORCED)
- All files must be `.ts` or `.tsx`. No `.js` files in `src/`.
- Service functions must have explicit return types.
- Use the `FirebaseError` type for error typing in catch blocks.

---

## Adding New Features

| Task | Where to put it |
|---|---|
| New Firebase Auth method | `src/services/AuthService.ts` |
| New Firestore collection | A new `src/services/[Domain]Service.ts` that wraps `FirestoreService` helpers |
| New globally shared state | `src/context/` |
| New reusable UI | `src/components/` |
| New page/screen | `src/pages/` |

---

## Debugging Conventions

All service functions include console logs for Chrome DevTools:

| Filter string | What it shows |
|---|---|
| `[AuthService]` | All auth events (login, logout, state changes) |
| `[FirestoreService]` | All generic Firestore reads/writes |
| `[CRUDService]` | All items collection reads/writes |
| `FAILED` | Any Firebase error — shows `.code` and `.message` |

**Network tab tips:**
- Filter `identitytoolkit` → raw Firebase Auth API calls
- Filter `firestore.googleapis.com` → raw Firestore API calls

**Application tab tips:**
- `IndexedDB → firebaseLocalStorageDb` → inspect persisted auth token
- `Local Storage` → inspect any app-level caching

---

## What NOT to Do

- Do NOT `import { signIn } from 'firebase/auth'` in a component.
- Do NOT create a second `initializeApp()` call anywhere.
- Do NOT bypass `firestore.rules` by adding `allow read, write: if true`.
- Do NOT use `any` types in service functions.
- Do NOT handle auth state with local `useState` — use `useAuth()`.
