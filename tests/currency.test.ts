import { describe, it, expect } from 'vitest';
import { currencyForLocale } from '@/lib/currency';

describe('currencyForLocale', () => {
  it('falls back to DEFAULT_CURRENCY when no locale-specific override is set', () => {
    process.env.DEFAULT_CURRENCY = 'USD';
    delete process.env.CURRENCY_EN;
    delete process.env.CURRENCY_FA;

    expect(currencyForLocale('en')).toBe('USD');
    expect(currencyForLocale('fa')).toBe('USD');
  });

  it('uses locale-specific currency override when provided', () => {
    process.env.DEFAULT_CURRENCY = 'USD';
    process.env.CURRENCY_EN = 'EUR';
    process.env.CURRENCY_FA = 'IRR';

    expect(currencyForLocale('en')).toBe('EUR');
    expect(currencyForLocale('fa')).toBe('IRR');
  });
});
