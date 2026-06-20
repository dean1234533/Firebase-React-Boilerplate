# React + Firebase SaaS Starter Kit

![GitHub Stars](https://img.shields.io/github/stars/dean1234533/Firebase-React-Boilerplate?style=flat-square&color=6366f1&label=Stars)
![GitHub Forks](https://img.shields.io/github/forks/dean1234533/Firebase-React-Boilerplate?style=flat-square&color=6366f1&label=Forks)
![GitHub Last Commit](https://img.shields.io/github/last-commit/dean1234533/Firebase-React-Boilerplate?style=flat-square&color=6366f1)
![License](https://img.shields.io/badge/License-Commercial-6366f1?style=flat-square)

**Stop configuring. Start building.**

A production-ready React + Firebase boilerplate with authentication, Firestore CRUD, Stripe billing, dark mode, and Vercel deployment built in. Everything is wired up, secured, and structured so you can ship your SaaS without fighting the stack.

**Live Demo:** [firebase-react-boilerplate.vercel.app](https://firebase-react-boilerplate.vercel.app)

---

## Why This Kit

Most Firebase tutorials give you working code. They don't give you a structure that holds up when your app grows, a second developer joins, or an AI assistant starts generating code for you.

This kit does.

- Firebase SDK calls are isolated in `src/services/` — components never touch the SDK
- Firestore security rules enforce least privilege by default
- Auth state lives in one place and one place only
- Dark mode is globally managed via React Context and persisted to localStorage
- Stripe checkout runs through a Vercel serverless function — secret keys never reach the browser
- Every service function logs structured errors for fast debugging in Chrome DevTools
- `AI_RULES.md` and `AI_INTEGRATION.md` ensure AI tools generate code that fits the architecture

---

## What's Included

### Authentication
- Email/password sign up and sign in
- Google OAuth with one click
- Persistent sessions across page refreshes
- Password reset flow
- Auth state managed globally via React Context — one listener, zero duplication

### Firestore CRUD Dashboard
- Add, edit, and delete items in real time using `onSnapshot`
- Data scoped to the authenticated user — no cross-user access possible
- Optimistic UI with per-item loading states

### Account Settings
- Update display name (synced to Firebase Auth + Firestore)
- View email (read-only)
- Delete account with typed confirmation modal
- Handles `auth/requires-recent-login` gracefully

### Stripe Billing
- Pricing page with Starter and Pro plans
- Stripe Checkout via Vercel serverless function
- Success and canceled redirect handling
- Secret key stays server-side — never exposed to the browser

### Dark Mode
- System-aware toggle (sun/moon icon in every header)
- Persisted to `localStorage` across sessions
- Powered by Tailwind CSS `dark:` classes and a global `ThemeContext`

### Security
- Production-grade `firestore.rules` using principle of least privilege
- Field-level write validation — clients cannot inject arbitrary data
- Default deny rule covers every collection not explicitly allowed
- Stripe subscription data written server-side via Admin SDK (bypasses client rules)

### Architecture
- `src/services/` — all Firebase and Stripe logic lives here, never in components
- `src/context/` — auth state + dark mode, each in its own context
- `src/hooks/` — clean `useAuth()` hook consumed anywhere
- `src/components/` — reusable `ProtectedRoute` guard
- `api/` — Vercel serverless functions for server-side Stripe calls
- `AI_INTEGRATION.md` — copy-paste prompt for Claude, Cursor, or Copilot

### Deployment
- Vercel-ready out of the box — zero config needed
- Environment variable template included (`.env.example`)
- SPA routing handled via `vercel.json`

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Auth + Database | Firebase v11 |
| Styling | Tailwind CSS v3 + Inter font |
| Routing | React Router v6 |
| Payments | Stripe |
| Hosting | Vercel |

---

## Quick Start

**1. Clone**
```bash
git clone https://github.com/your-username/firebase-starter-kit.git
cd firebase-starter-kit
```

**2. Install**
```bash
npm install
```

**3. Configure**
```bash
cp .env.example .env.local
# Fill in your Firebase and Stripe credentials — see SETUP.md
```

**4. Run**
```bash
npm run dev
# http://localhost:3000
```

**5. Deploy**

Push to GitHub, import in [vercel.com/new](https://vercel.com/new), add your environment variables. Done.

Full deployment walkthrough in [SETUP.md](SETUP.md).

---

## Project Structure

```
src/
├── firebase/
│   └── firebase.ts           ← SDK init only. Zero logic.
├── services/
│   ├── AuthService.ts        ← signUpWithEmail, signInWithEmail, signInWithGoogle, signOut
│   ├── FirestoreService.ts   ← Generic CRUD helpers (get, set, add, update, delete, query)
│   ├── CRUDService.ts        ← Domain service: real-time items collection
│   ├── SettingsService.ts    ← updateDisplayName, deleteAccount
│   └── StripeService.ts      ← redirectToCheckout (calls /api/create-checkout-session)
├── context/
│   ├── AuthContext.tsx       ← Single onAuthStateChanged listener, exposes useAuth()
│   └── ThemeContext.tsx      ← Dark mode toggle, persisted to localStorage
├── hooks/
│   └── useAuth.ts            ← useAuth() hook
├── components/
│   └── ProtectedRoute.tsx    ← Redirects unauthenticated users to /auth
└── pages/
    ├── AuthPage.tsx           ← Login + Sign Up (single page, toggle)
    ├── DashboardPage.tsx      ← Protected CRUD dashboard
    ├── SettingsPage.tsx       ← Profile management + account deletion
    └── BillingPage.tsx        ← Stripe pricing page

api/
└── create-checkout-session.ts  ← Vercel serverless function (Stripe backend)
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
# Firebase
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

# Stripe (server-side only — never expose in frontend)
STRIPE_SECRET_KEY
STRIPE_PRICE_STARTER
STRIPE_PRICE_PRO

# App URL (for Stripe redirect)
VITE_APP_URL
```

---

## Documentation

| File | Purpose |
|---|---|
| [SETUP.md](SETUP.md) | Firebase setup + Vercel deployment walkthrough |
| [SECURITY.md](SECURITY.md) | Firestore rules explained + how to test them |
| [AI_INTEGRATION.md](AI_INTEGRATION.md) | Prompt for adding features without breaking the architecture |
| [AI_RULES.md](AI_RULES.md) | Architecture contract for AI coding tools |
| [README_SETTINGS.md](README_SETTINGS.md) | Settings module details + how to remove it |

---

## License

See [LICENSE.txt](LICENSE.txt). Commercial use permitted. Redistribution and resale of source code prohibited.
