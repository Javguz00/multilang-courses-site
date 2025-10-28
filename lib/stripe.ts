import Stripe from 'stripe';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  // Use a Stripe API version compatible with installed SDK types
  return new Stripe(key, { apiVersion: '2023-10-16' });
}
