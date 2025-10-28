export function localeTag(locale: 'fa' | 'en') {
  return locale === 'fa' ? 'fa-IR' : 'en-US';
}

export function currencyForLocale(locale: 'fa' | 'en') {
  const envKey = `CURRENCY_${locale.toUpperCase()}` as 'CURRENCY_FA' | 'CURRENCY_EN';
  return (process.env[envKey] as string) || (process.env.DEFAULT_CURRENCY as string) || 'USD';
}

export function formatPrice(value: unknown, locale: 'fa' | 'en') {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : Number(value as any);
  const currency = currencyForLocale(locale);
  return new Intl.NumberFormat(localeTag(locale), { style: 'currency', currency }).format(Number.isFinite(num) ? num : 0);
}
