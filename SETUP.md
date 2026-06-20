# SETUP.md — Firebase + Vercel Configuration Walkthrough

This guide takes you from a blank Firebase project to a live Vercel deployment. Estimated time: 15 minutes.

---

## 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter a project name and follow the prompts
4. Disable Google Analytics if you don't need it (optional)

---

## 2. Enable Authentication

Firebase Authentication must be configured before any login flow will work.

1. In the Firebase Console sidebar, click **Build → Authentication**
2. Click **Get started**
3. Under the **Sign-in method** tab, enable the following providers:

**Email/Password**
- Click **Email/Password**
- Toggle **Enable** on
- Click **Save**

**Google**
- Click **Google**
- Toggle **Enable** on
- Set a support email (required)
- Click **Save**

> For local development, `localhost` is already in the Authorized Domains list. For your Vercel deployment, you must add your `.vercel.app` domain (or custom domain) under **Authentication → Settings → Authorized Domains** — otherwise Google login will throw `auth/unauthorized-domain`.

---

## 3. Create a Firestore Database

1. In the sidebar, click **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** — this kit's `firestore.rules` handles access control
4. Select a region closest to your users
5. Click **Enable**

**Deploy the security rules:**

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project and give it an alias, e.g. "default"
firebase deploy --only firestore:rules
```

---

## 4. Get Your Firebase Web Config Keys

This is where your `.env.local` and Vercel environment variable values come from.

1. In the Firebase Console, click the **gear icon → Project settings**
2. Scroll down to **Your apps**
3. If no web app exists, click the **</>** (Web) icon to register one — name it anything
4. Copy the config object:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Paste each value into `.env.local` for local development:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> `.env.local` is in `.gitignore`. Never commit it. These values go into Vercel separately in the next step.

---

## 5. Run Locally

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`. Verify login works before deploying.

---

## 6. Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push your project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Under **Environment Variables**, add each of the six `VITE_FIREBASE_*` keys and their values from Step 4
5. Set **Framework Preset** to `Vite`
6. Click **Deploy**

Vercel detects the Vite project automatically. The `dist/` output directory and build command (`npm run build`) are configured correctly out of the box.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to link your project. Then add environment variables:

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

Select **Production**, **Preview**, and **Development** for each. Then deploy:

```bash
vercel --prod
```

---

## 7. Add Your Vercel Domain to Firebase Auth

After your first Vercel deployment, Google login will fail until you whitelist the domain.

1. Copy your Vercel deployment URL (e.g. `your-app.vercel.app`)
2. Firebase Console → **Authentication → Settings → Authorized Domains**
3. Click **Add domain** and paste your Vercel URL
4. Repeat for any custom domain you attach later

---

## 8. SPA Routing on Vercel

React Router handles client-side routing, so all paths must serve `index.html`. Vercel handles this automatically for Vite projects — no `vercel.json` configuration is needed.

If you ever add a custom `vercel.json`, include this rewrite rule to preserve routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Checklist Before Shipping

- [ ] `.env.local` is in `.gitignore` and not committed to the repo
- [ ] Email/Password auth is enabled in Firebase Console
- [ ] Google auth is enabled in Firebase Console
- [ ] Vercel deployment URL is added to Firebase Authorized Domains
- [ ] All six `VITE_FIREBASE_*` variables are set in the Vercel dashboard
- [ ] Firestore is in production mode
- [ ] `firestore.rules` is deployed (`firebase deploy --only firestore:rules`)
- [ ] `npm run build` completes without errors locally
