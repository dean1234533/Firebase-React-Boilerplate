# React + Firebase SaaS Starter Kit

**Stop configuring. Start building.**

A production-ready React + Firebase boilerplate with authentication, Firestore CRUD, and Vercel deployment built in. Everything is wired up, secured, and structured so you can ship your SaaS without fighting the stack.

**Live Demo:** [your-demo-link-here]

---

## Why This Kit

Most Firebase tutorials give you working code. They don't give you a structure that holds up when your app grows, a second developer joins, or an AI assistant starts generating code for you.

This kit does.

- Firebase SDK calls are isolated in `src/services/` — components never touch the SDK
- Firestore security rules enforce least privilege by default
- Auth state lives in one place and one place only
- Every service function logs structured errors for fast debugging in Chrome DevTools
- An `AI_RULES.md` and `AI_INTEGRATION.md` ensure AI tools generate code that fits the architecture

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

### Security
- Production-grade `firestore.rules` using principle of least privilege
- Field-level write validation — clients cannot inject arbitrary data
- Default deny rule covers every collection not explicitly allowed

### Architecture
- `src/services/` — all Firebase logic lives here, never in components
- `src/context/` — single auth state listener for the entire app
- `src/hooks/` — clean `useAuth()` hook consumed anywhere
- `src/components/` — reusable `ProtectedRoute` guard
- `AI_INTEGRATION.md` — copy-paste prompt for Claude, Cursor, or Copilot

### Deployment
- Vercel-ready out of the box — zero config needed
- Environment variable template included
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
# Fill in your Firebase credentials — see SETUP.md for exactly where to find them
```

**4. Run**
```bash
npm run dev
# http://localhost:3000
```

**5. Deploy**

Push to GitHub, import in [vercel.com/new](https://vercel.com/new), add your `VITE_FIREBASE_*` keys as environment variables. Done.

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
│   └── CRUDService.ts        ← Domain service: real-time items collection
├── context/
│   └── AuthContext.tsx       ← Single onAuthStateChanged listener, exposes useAuth()
├── hooks/
│   └── useAuth.ts            ← useAuth() hook
├── components/
│   └── ProtectedRoute.tsx    ← Redirects unauthenticated users to /auth
└── pages/
    ├── AuthPage.tsx           ← Login + Sign Up (single page, toggle)
    └── DashboardPage.tsx      ← Protected CRUD dashboard
```

---

## Documentation

| File | Purpose |
|---|---|
| [SETUP.md](SETUP.md) | Firebase setup + Vercel deployment walkthrough |
| [SECURITY.md](SECURITY.md) | Firestore rules explained + how to test them |
| [AI_INTEGRATION.md](AI_INTEGRATION.md) | Prompt for adding features without breaking the architecture |
| [AI_RULES.md](AI_RULES.md) | Architecture contract for AI coding tools |

---

## License

See [LICENSE.txt](LICENSE.txt). Commercial use permitted. Redistribution and resale of source code prohibited.
