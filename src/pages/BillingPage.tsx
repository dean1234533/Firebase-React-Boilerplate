import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { redirectToCheckout } from '@/services/StripeService';
import { useTheme } from '@/context/ThemeContext';

export function BillingPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  async function handleSubscribe(priceId: 'price_starter' | 'price_pro') {
    setLoadingPlan(priceId);
    setError(null);
    const { error } = await redirectToCheckout(priceId);
    if (error) setError(error);
    setLoadingPlan(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Billing</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:block">{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">
            Stripe Connected · Dark Mode: {theme === 'dark' ? 'On' : 'Off'}
          </span>
        </div>

        <div className="mb-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Billing</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a plan to unlock full access.</p>
        </div>

        {/* Success / canceled banners */}
        {success && (
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 px-5 py-4 text-sm text-green-700 dark:text-green-300 font-medium">
            Subscription activated. Welcome aboard!
          </div>
        )}
        {canceled && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-5 py-4 text-sm text-amber-700 dark:text-amber-300 font-medium">
            Checkout canceled. No charge was made.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-5 py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Starter */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6 flex flex-col">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Starter</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$9</span>
                <span className="mb-1 text-sm text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Perfect for solo projects.</p>
            </div>
            <ul className="mb-6 space-y-2 flex-1">
              {['Firebase Auth', 'CRUD Dashboard', 'Firestore rules', 'Vercel deploy'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg className="h-4 w-4 text-indigo-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('price_starter')}
              disabled={loadingPlan !== null}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              {loadingPlan === 'price_starter' ? 'Redirecting…' : 'Get Starter'}
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-indigo-500 bg-white dark:bg-slate-800 shadow-sm p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Pro</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">$29</span>
                <span className="mb-1 text-sm text-slate-500 dark:text-slate-400">/mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">For teams shipping fast.</p>
            </div>
            <ul className="mb-6 space-y-2 flex-1">
              {['Everything in Starter', 'Stripe Billing', 'Dark Mode', 'Settings module', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <svg className="h-4 w-4 text-indigo-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('price_pro')}
              disabled={loadingPlan !== null}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingPlan === 'price_pro' ? 'Redirecting…' : 'Get Pro'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
