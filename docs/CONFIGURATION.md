# Configuration Guide

This guide covers the environment variables and configuration needed for local development and production.

## Overview

Copy `.env.example` to `.env` and fill the variables appropriate for your environment.

- DATABASE_URL: PostgreSQL connection string (Neon, Supabase, Render, RDS, etc.)
- NEXTAUTH_URL / NEXTAUTH_SECRET: NextAuth core config
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET: Stripe API and webhook verification keys
- NEXT_PUBLIC_SITE_URL: Absolute origin used for canonical URLs, robots sitemap reference, sitemap base, and JSON-LD
- Analytics (optional): GA or Matomo toggles
- Email (optional): SMTP settings
- ALLOWED_ORIGINS: CSRF allowlist for destructive admin actions

## Variables

### Database
- DATABASE_URL: `postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public`
  - Example (local): `postgresql://postgres:postgres@localhost:5432/multilang_courses?schema=public`
  - Neon/Supabase often require `pgbouncer=true&connection_limit=1` in query string.

### NextAuth
- NEXTAUTH_URL: Your public URL (prod) or `http://localhost:3000` in dev.
- NEXTAUTH_SECRET: Strong random string (generate with `openssl rand -base64 32` or similar).

When running behind a proxy/CDN (Vercel, Cloudflare, Nginx), also set:

- NEXTAUTH_TRUST_HOST=`true`
  - Allows NextAuth to respect `X-Forwarded-*` headers from the platform and avoids callback/URL mismatches.
  - Ensure `NEXTAUTH_URL` exactly matches your public origin (scheme + host).

### Stripe (test or live)
- STRIPE_SECRET_KEY: `sk_test_...` (test) or `sk_live_...` (live)
- STRIPE_WEBHOOK_SECRET: `whsec_...` from Stripe CLI (dev) or Dashboard webhook (prod)

### Zarinpal (Iran domestic)
- PAYMENT_PROVIDER: `stripe` (default) or `zarinpal`
- ZARINPAL_MERCHANT_ID: Your merchant ID from Zarinpal
- ZARINPAL_SANDBOX: `true|false` (use `true` for testing)
- Pricing note: When using Zarinpal, course prices are expected to be in Tomans. Ensure your course `price` values reflect Tomans for fa locale.

### SEO
- NEXT_PUBLIC_SITE_URL
  - What it does: Sets the absolute origin used to build canonical URLs, the base for `/sitemap.xml`, the `sitemap` property in `robots.txt`, and absolute URLs in SSR JSON-LD.
  - Why it matters: If this is wrong (or left as localhost), search engines may see mixed-domain canonicals or a sitemap pointing to the wrong host.
  - Recommended values:
    - Dev: `http://localhost:3000` (or the port you use)
    - Prod: `https://yourdomain.com`
  - Post-deploy verification:
    - View source on `https://yourdomain.com/en` and confirm canonical URLs (if present) point to your domain
    - `https://yourdomain.com/sitemap.xml` URLs start with your domain
    - `https://yourdomain.com/robots.txt` includes `Sitemap: https://yourdomain.com/sitemap.xml`
    - Course detail JSON-LD contains absolute URLs with your domain

## Environment matrix (Vercel and local)

Use this matrix to set the right values per environment and avoid mixed-domain links or Stripe webhook issues.

| Variable | Production | Preview | Development |
|---|---|---|---|
| DATABASE_URL | Managed Postgres (prod DB) | Managed Postgres (staging/preview DB) or same as prod with caution | Local Postgres (Docker/bare): `postgresql://postgres:postgres@localhost:5432/multilang_courses?schema=public` |
| NEXTAUTH_URL | `https://yourdomain.com` | Vercel preview URL, e.g. `https://<branch>-<project>-<hash>.vercel.app` | `http://localhost:3000` |
| NEXTAUTH_SECRET | Strong random string | Same format; distinct from prod | Strong random string (can differ) |
| NEXTAUTH_TRUST_HOST | `true` | `true` | Not required locally |
| NEXT_PUBLIC_SITE_URL | `https://yourdomain.com` | Match preview URL (optional; if set to prod, canonicals point to prod domain) | `http://localhost:3000` |
| STRIPE_SECRET_KEY | Live key: `sk_live_...` | Test key: `sk_test_...` (recommended) | Test key: `sk_test_...` |
| STRIPE_WEBHOOK_SECRET | From Stripe Dashboard live webhook | From Stripe Dashboard test webhook | From Stripe CLI (`stripe listen`) |
| Analytics (GA/Matomo) | Enable if desired | Usually disabled to keep preview clean | Optional |
| ALLOWED_ORIGINS | Optional list of extra origins | Optional list of preview origins | Usually empty |

Notes
- On Preview, you can leave `NEXT_PUBLIC_SITE_URL` pointing to Production if you want canonical links to the prod domain. If you prefer fully isolated previews, set it to the preview URL and verify sitemap/robots references.
- Stripe webhooks are environment-specific: test vs live signing secrets and endpoints are distinct. Don’t reuse the live secret in preview or dev.

## Tooling versions and build flags

- Node.js: 18.18+ or 20.x LTS (match Vercel’s default runtime). We test with Node 20.
- Next.js: 14.2.x
- TypeScript: 5.3+
- Prisma: 5.20+

Optional build flags
- `NEXT_TELEMETRY_DISABLED=1` to disable Next.js telemetry in CI.
- Low-memory build environments may need `NODE_OPTIONS=--max_old_space_size=4096`.

### Analytics (optional)
Choose one provider at a time.

- Google Analytics
  - NEXT_PUBLIC_ANALYTICS="ga"
  - NEXT_PUBLIC_GA_ID="G-XXXXXXXX"
- Matomo
  - NEXT_PUBLIC_ANALYTICS="matomo"
  - NEXT_PUBLIC_MATOMO_URL="https://matomo.example.com"
  - NEXT_PUBLIC_MATOMO_SITE_ID="1"

### Email (optional)
- EMAIL_ENABLED: `true|false`
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

### CSRF allowlist
- ALLOWED_ORIGINS: Comma-separated exact origins (protocol + host), e.g. `https://admin.example.com,https://app.example.com`

## Local steps
1. `cp .env.example .env` and set variables
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run db:seed`
5. `npm run dev` and open http://localhost:3000

## Stripe dev webhook
Run:

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## Production checklist
- Set all variables in your host (Vercel → Project Settings → Environment Variables)
- Use `npm run prisma:migrate:deploy` against the production DB before first deploy (or via CI/CD job)
- Update `NEXT_PUBLIC_SITE_URL` to your public HTTPS URL
- Create a Stripe Dashboard webhook pointing to `https://yourdomain.com/api/stripe/webhook` and paste its `whsec_...` into env
