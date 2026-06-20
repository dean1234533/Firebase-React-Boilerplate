# Gumroad Sales Copy

## Product Title
React + Firebase SaaS Starter Kit — Auth, CRUD, Vercel-Ready

---

## Short Description (shown in search / preview)
Skip 20+ hours of Firebase setup. Production-ready auth, Firestore CRUD, and a clean modular architecture. Clone, configure, ship.

---

## Full Sales Description

---

**You've been here before.**

You have a SaaS idea. You open a new project, install Firebase, and two hours later you're debugging `onAuthStateChanged`, fighting security rules, and wondering why your Google sign-in works on localhost but not in production.

This kit skips all of that.

---

### What You Get

**Complete Authentication — out of the box**
Email/password sign up and login, Google OAuth, persistent sessions, and password reset. Auth state is managed globally via React Context so you never write another `onAuthStateChanged` call. Just use `useAuth()` anywhere in your app.

**Firestore CRUD Dashboard — fully wired**
A working items dashboard with real-time updates (`onSnapshot`), inline editing, and per-item loading states. Data is scoped to each user. The UI updates the moment Firestore does — no polling, no manual refreshes.

**Production Security — not an afterthought**
Firestore rules enforce least privilege from day one. Users can only read and write their own data. Field-level validation blocks clients from writing arbitrary payloads. The default rule denies everything not explicitly allowed. This is the security setup most tutorials never show you.

**Modular Architecture — built to scale**
Firebase SDK calls live in `src/services/`. Components never touch the SDK directly. When you add a new feature, you know exactly where the code goes. When something breaks, you know exactly where to look.

**AI-Ready — works with Claude, Cursor, and Copilot**
Includes a copy-paste prompt that gives any AI assistant the full architecture context before it generates code. Your AI won't scatter Firebase calls across random components or create a second `initializeApp()`. The `AI_RULES.md` file keeps everything consistent across sessions.

**Vercel Deployment — zero config**
`vercel.json` is included. SPA routing is handled. Push to GitHub, import on Vercel, add your six environment variables, done.

---

### What's Included

- Full React 18 + Vite + TypeScript project (strict mode)
- Firebase v11 — Auth + Firestore
- Tailwind CSS v3 with Inter font (the SaaS standard)
- `AuthPage.tsx` — login/signup toggle with Google OAuth
- `DashboardPage.tsx` — real-time CRUD with inline editing
- `AuthService.ts`, `FirestoreService.ts`, `CRUDService.ts` — service layer
- `firestore.rules` — production-grade security rules
- `vercel.json` — Vercel deployment config
- `README.md`, `SETUP.md`, `SECURITY.md` — full documentation
- `AI_INTEGRATION.md` — AI prompt for extending the codebase safely
- `AI_RULES.md` — architecture contract for AI tools

---

### This is for you if:

- You're a founder who wants to ship fast without becoming a Firebase expert
- You've built Firebase apps before and know how messy they get without structure
- You're using AI tools to build and want the generated code to stay clean
- You want production security rules, not `allow read, write: if true`

---

### This is NOT for you if:

- You want a drag-and-drop no-code tool
- You've never written React before (basic React knowledge required)
- You need a backend beyond Firestore (this is a frontend + Firebase kit)

---

### The Math

A senior developer costs $100–150/hour.
Firebase architecture setup, auth, security rules, and documentation: 20+ hours.
That's $2,000–3,000 of work.

This kit: a fraction of that. Yours to keep and build on forever.

---

### Tech Stack

React 18 · TypeScript · Vite · Firebase v11 · Tailwind CSS · React Router v6 · Vercel

---

**One purchase. One license. Build as many products as you want on top of it.**

See `LICENSE.txt` for full terms. Redistribution and resale of source code are not permitted.
