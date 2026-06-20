# SETUP.md — From Zero to Deployed

Follow these steps in order. Takes about 20 minutes.

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

Paste the contents of `firestore.rules` directly into the Firebase Console → Firestore → **Rules** tab and click **Publish**.

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

## Step 5 — Set Up Stripe (Test Mode)

This project uses **Stripe test mode**. No real charges are made until you switch to live keys.

1. Go to [dashboard.stripe.com/test/dashboard](https://dashboard.stripe.com/test/dashboard)
2. **Get your test secret key:**
   - Sidebar → **Developers → API keys**
   - Copy the **Secret key** (`sk_test_...`)

3. **Create your products:**
   - Sidebar → **Product catalog → Add product**
   - Create **Starter** — $9/month recurring → Save
   - Copy the **Price ID** (`price_...`) from the pricing section
   - Repeat for **Pro** — $29/month recurring
   - Copy that Price ID too

> Keep Stripe in test mode until you're ready to go live. Switch to live keys (`sk_live_...`) in Vercel env vars when launching.

---

## Step 6 — Configure Environment Variables

**For local development:**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all values:

```bash
# Firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...

# App URL (for Stripe redirect after checkout)
VITE_APP_URL=http://localhost:3000
```

> `.env.local` is already in `.gitignore`. Never commit it.

**Test it locally:**

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create an account, and confirm login works before deploying.

---

## Step 7 — Deploy to Vercel

**Option A — Vercel Dashboard (recommended)**

1. Push your project to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) → import your repo
3. Under **Environment Variables**, add all keys from `.env.local`
   - Firebase keys: `VITE_FIREBASE_*`
   - Stripe keys: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`
   - App URL: `VITE_APP_URL` set to your Vercel deployment URL
4. Framework preset will be detected as **Vite** automatically
5. Click **Deploy**

**Option B — Vercel CLI**

```bash
npm install -g vercel
vercel
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PRICE_STARTER
vercel env add STRIPE_PRICE_PRO
vercel env add VITE_APP_URL
# ... add all VITE_FIREBASE_* vars too
vercel --prod
```

---

## Step 8 — Add Your Vercel Domain to Firebase

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
- [ ] `firestore.rules` deployed (via Console)
- [ ] All 6 `VITE_FIREBASE_*` vars set in Vercel
- [ ] `STRIPE_SECRET_KEY` set in Vercel (test key for now: `sk_test_...`)
- [ ] `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO` set in Vercel
- [ ] `VITE_APP_URL` set to your Vercel URL
- [ ] Vercel domain added to Firebase Authorized Domains
- [ ] Google sign-in tested on the live Vercel URL
- [ ] Stripe checkout tested with [test card 4242 4242 4242 4242](https://stripe.com/docs/testing)
- [ ] `.env.local` is NOT committed to your repo
