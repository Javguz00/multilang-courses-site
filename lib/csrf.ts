import { headers } from 'next/headers';

export function isAllowedOrigin(): boolean {
  try {
    if (process.env.NODE_ENV !== 'production') return true;
    const h = headers();
    const origin = h.get('origin');
    const base = process.env.NEXTAUTH_URL || '';
    const allowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!origin) return false;
    const o = new URL(origin);
    if (allowed.length > 0) {
      // Allow any host in ALLOWED_ORIGINS (host match), protocol must be https in prod
      const ok = allowed.some((u) => {
        try {
          const x = new URL(u);
          return x.host === o.host && x.protocol === o.protocol;
        } catch {
          return false;
        }
      });
      if (ok) return true;
    }
    if (!base) return false;
    const b = new URL(base);
    return o.host === b.host && o.protocol === b.protocol;
  } catch {
    return false;
  }
}
