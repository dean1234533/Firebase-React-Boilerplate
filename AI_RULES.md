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
│   ├── CRUDService.ts       ← Domain service: users/{uid}/items CRUD
│   ├── SettingsService.ts   ← Profile update + account deletion
│   └── StripeService.ts     ← Calls /api/create-checkout-session (frontend only)
├── context/
│   ├── AuthContext.tsx      ← Global auth state (onAuthStateChanged listener)
│   └── ThemeContext.tsx     ← Dark mode state (persisted to localStorage)
├── hooks/
│   └── useAuth.ts           ← Re-exports useAuth from AuthContext
├── components/
│   └── ProtectedRoute.tsx   ← Route guard wrapper
├── pages/
│   ├── AuthPage.tsx         ← Login + Sign Up (single page, toggle)
│   ├── DashboardPage.tsx    ← Protected CRUD dashboard
│   ├── SettingsPage.tsx     ← Profile management + account deletion
│   └── BillingPage.tsx      ← Stripe subscription pricing page
└── ...
api/
└── create-checkout-session.ts  ← Vercel serverless function (Stripe backend)
```

---

## Mandatory Rules

### 1. Separation of Concerns (ENFORCED)
- `firebase/firebase.ts` exports ONLY initialized service objects (`auth`, `db`, `app`).
- ALL Firebase SDK function calls (`signIn`, `getDoc`, `setDoc`, etc.) MUST live in `src/services/`.
- React components MUST NOT import from `firebase/auth` or `firebase/firestore` directly.
- If you need new Firebase functionality, add it to the appropriate service file.
- Stripe API calls MUST go through the serverless function in `api/`. Never put `STRIPE_SECRET_KEY` in the frontend.

### 2. Error Handling (ENFORCED)
- Every function in `src/services/` MUST have a `try/catch` block.
- Every `catch` block MUST log `error.code` and `error.message` to the console.
- Use the prefix `[ServiceName]` in all console logs (e.g., `[AuthService]`, `[StripeService]`).
- Console logs MUST include structured data: `{ code, message, context }` — not just a string.

### 3. Auth State (ENFORCED)
- There is ONE place that calls `onAuthStateChanged`: `AuthContext.tsx`.
- All components access auth state via `useAuth()` from `@/hooks/useAuth`.
- Do NOT call `subscribeToAuthState` or `onAuthStateChanged` anywhere else.

### 4. Theme State (ENFORCED)
- Dark mode state lives in `ThemeContext.tsx` only.
- All components access theme via `useTheme()` from `@/context/ThemeContext`.
- Do NOT manage dark mode with local `useState` in any component.
- Dark mode is toggled by adding/removing the `dark` class on `<html>`. Tailwind handles the rest.

### 5. Security (ENFORCED)
- `firestore.rules` uses the principle of least privilege.
- Default rule at the bottom of `firestore.rules` is `allow read, write: if false`.
- New collections MUST be explicitly allowed — never remove the default deny rule.
- Do NOT use `allow read, write: if true` in any rule.
- Stripe subscription data is written server-side via Admin SDK (bypasses rules by design).

### 6. TypeScript (ENFORCED)
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
| New page/screen | `src/pages/` + add route in `src/App.tsx` |
| New server-side API call | `api/[endpoint].ts` (Vercel serverless function) |
| New Stripe action | Add to `src/services/StripeService.ts` (calls `api/`) |

---

## Debugging Conventions

All service functions include console logs for Chrome DevTools:

| Filter string | What it shows |
|---|---|
| `[AuthService]` | All auth events (login, logout, state changes) |
| `[FirestoreService]` | All generic Firestore reads/writes |
| `[CRUDService]` | All items collection reads/writes |
| `[SettingsService]` | Profile updates, account deletion |
| `[StripeService]` | Checkout session requests |
| `FAILED` | Any error — shows `.code` and `.message` |

**Network tab tips:**
- Filter `identitytoolkit` → raw Firebase Auth API calls
- Filter `firestore.googleapis.com` → raw Firestore API calls
- Filter `create-checkout-session` → Stripe checkout requests

**Application tab tips:**
- `IndexedDB → firebaseLocalStorageDb` → inspect persisted auth token
- `Local Storage → theme` → `"light"` or `"dark"` (dark mode preference)

---

## What NOT to Do

- Do NOT `import { signIn } from 'firebase/auth'` in a component.
- Do NOT create a second `initializeApp()` call anywhere.
- Do NOT bypass `firestore.rules` by adding `allow read, write: if true`.
- Do NOT use `any` types in service functions.
- Do NOT handle auth state with local `useState` — use `useAuth()`.
- Do NOT handle theme state with local `useState` — use `useTheme()`.
- Do NOT put Stripe secret keys in the frontend — they belong in `api/` only.
- Do NOT add dark mode classes manually to `<html>` — `ThemeContext` handles that.
