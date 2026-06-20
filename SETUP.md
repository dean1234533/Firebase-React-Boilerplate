# SETUP.md — From Zero to Deployed

Follow these steps in order. Takes about 15 minutes.

---

## Step 1 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it → disable Google Analytics (optional) → click **Create**

---

## Step 2 — Enable Authentication

1. Sidebar → **Build → Authentication** → **Get started**
2. Click the **Sign-in method** tab and enable:

**Email/Password**
- Click **Email/Password** → toggle **Enable** → **Save**

**Google**
- Click **Google** → toggle **Enable** → add a support email → **Save**

> After deploying to Vercel, come back here and add your `.vercel.app` domain under **Authentication → Settings → Authorized Domains**. Without this, Google sign-in will fail in production with `auth/unauthorized-domain`.

---

## Step 3 — Create a Firestore Database

1. Sidebar → **Build → Firestore Database** → **Create database**
2. Select **Start in production mode**
3. Choose a region → **Enable**

**Deploy the security rules:**

The `firestore.rules` file in this repo is production-ready. Deploy it now:

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # select your project, set alias to "default"
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` directly into the Firebase Console → Firestore → **Rules** tab and click **Publish**.

---

## Step 4 — Get Your Firebase Config Keys

1. Firebase Console → gear icon → **Project settings**
2. Scroll to **Your apps** → click the **</>** web icon if no app exists → name it → **Register app**
3. Copy the config object:

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

---

## Step 5 — Configure Environment Variables

**For local development:**

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your values:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> `.env.local` is already in `.gitignore`. Never commit it.

**Test it locally:**

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an account, and confirm login works before deploying.

---

## Step 6 — Deploy to Vercel

**Option A — Vercel Dashboard (recommended)**

1. Push your project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) → import your repo
3. Under **Environment Variables**, add all six `VITE_FIREBASE_*` keys
4. Framework preset will be detected as **Vite** automatically
5. Click **Deploy**

**Option B — Vercel CLI**

```bash
npm install -g vercel
vercel
```

Add environment variables:
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

Select **Production**, **Preview**, and **Development** for each. Then:
```bash
vercel --prod
```

---

## Step 7 — Add Your Vercel Domain to Firebase

Google sign-in will fail until you do this.

1. Copy your Vercel URL (e.g. `your-app.vercel.app`)
2. Firebase Console → **Authentication → Settings → Authorized Domains**
3. Click **Add domain** → paste your URL → **Add**

Repeat for any custom domain you attach later.

---

## Pre-Launch Checklist

- [ ] Email/Password auth enabled in Firebase Console
- [ ] Google auth enabled with support email set
- [ ] Firestore created in production mode
- [ ] `firestore.rules` deployed
- [ ] All 6 `VITE_FIREBASE_*` vars set in Vercel dashboard
- [ ] Vercel domain added to Firebase Authorized Domains
- [ ] Google sign-in tested on the live Vercel URL
- [ ] `.env.local` is NOT committed to your repo
