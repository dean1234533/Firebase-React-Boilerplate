export type PriceId = 'price_starter' | 'price_pro';

export interface CheckoutResult {
  url?: string;
  error?: string;
}

export async function redirectToCheckout(priceId: PriceId): Promise<CheckoutResult> {
  try {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      return { error: error ?? 'Failed to create checkout session.' };
    }

    const { url } = await res.json();
    window.location.href = url;
    return { url };
  } catch (err) {
    return { error: 'Network error. Please try again.' };
  }
}
