import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

const PRICE_MAP: Record<string, string> = {
  price_starter: process.env.STRIPE_PRICE_STARTER!,
  price_pro: process.env.STRIPE_PRICE_PRO!,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId } = req.body as { priceId: string };
  const stripePriceId = PRICE_MAP[priceId];

  if (!stripePriceId) {
    return res.status(400).json({ error: `Invalid price ID: ${priceId}` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${process.env.VITE_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.VITE_APP_URL}/billing?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[create-checkout-session] FAILED:', message);
    return res.status(500).json({ error: message });
  }
}
