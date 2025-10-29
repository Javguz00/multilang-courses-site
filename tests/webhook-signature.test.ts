import { describe, it, expect } from 'vitest';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

describe('Stripe webhook signature verification', () => {
  it('accepts a valid signature and rejects an invalid one', () => {
    // Provide a dummy secret key for the Stripe client (not used for verification itself)
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';

    const stripe = getStripe();

    const webhookSecret = 'whsec_test_123';
    const payloadObj = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123' } },
    };
    const payload = JSON.stringify(payloadObj);

    // Generate a valid header for our fake payload
    const validHeader = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    // Should not throw for valid signature
    const event = stripe.webhooks.constructEvent(payload, validHeader, webhookSecret);
    expect(event.id).toBe('evt_test_123');
    expect(event.type).toBe('checkout.session.completed');

    // Using an invalid secret should cause verification to fail
    expect(() => stripe.webhooks.constructEvent(payload, validHeader, 'whsec_wrong')).toThrow();
  });
});
