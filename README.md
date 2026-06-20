# React + Firebase Starter Kit

A production-ready boilerplate for building authenticated web apps with Firestore, deployed on Vercel. Skip the setup and ship your product — the architecture, security rules, and service layer are already done.

**Live Demo:** [your-demo-link-here]

---

## Features

- **Firebase Auth** — Email/password and Google OAuth out of the box. Persistent sessions, password reset, and a single `onAuthStateChanged` listener wired to React context.
- **Firestore CRUD** — A working items dashboard with add and delete. Generic service helpers you can extend to any collection in minutes.
- **Modular Architecture** — Firebase SDK calls are isolated in `src/services/`. Components never touch the SDK directly. Adding features doesn't risk breaking what already works.
- **AI-Ready** — Includes `AI_RULES.md` and `AI_INTEGRATION.md` so Claude, Cursor, or Copilot understand the folder structure and won't break the service layer when generating new features.
- **Security by Default** — Firestore rules enforce least privilege. Users can only read and write their own data. Default deny covers every collection not explicitly allowed.
- **TypeScript throughout** — Strict mode, explicit return types on all service functions, and no `any` escapes.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Auth + Database | Firebase v11 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Hosting | Vercel |

---

## Quick Start

**1. Clone the repo**

```bash
git clone https://github.com/your-username/firebase-starter-kit.git
cd firebase-starter-kit
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure Firebase**

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Firebase project credentials. See [SETUP.md](SETUP.md) for exactly where to find them.

**4. Deploy to Vercel**

Push to GitHub, import the repo in [vercel.com/new](https://vercel.com/new), and add your `VITE_FIREBASE_*` keys as Environment Variables in the Vercel dashboard. See [SETUP.md](SETUP.md) for the full walkthrough.

Or deploy instantly from the terminal:

```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
src/
├── firebase/
│   └── firebase.ts          ← SDK init only. No logic.
├── services/
│   ├── AuthService.ts       ← All auth calls (login, logout, Google, password reset)
│   ├── FirestoreService.ts  ← Generic Firestore CRUD helpers
│   └── CRUDService.ts       ← Domain service: users/{uid}/items collection
├── context/
│   └── AuthContext.tsx      ← Single source of truth for auth state
├── hooks/
│   └── useAuth.ts           ← useAuth() hook
├── components/
│   └── ProtectedRoute.tsx   ← Route guard — redirects unauthenticated users
└── pages/
    ├── LoginPage.tsx
    └── DashboardPage.tsx
```

---

## Security

Firestore rules are in `firestore.rules`. See [SECURITY.md](SECURITY.md) for a full explanation of what is allowed, what is denied, and how to test the rules before shipping.

---

## Extending with AI

See [AI_INTEGRATION.md](AI_INTEGRATION.md) for a ready-to-use prompt you can drop into Claude, Cursor, or Copilot to add new features without breaking the architecture.

---

## License

MIT — use it for personal or commercial projects.
