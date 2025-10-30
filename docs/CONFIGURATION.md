# Configuration Guide

This guide covers the environment variables and configuration needed for local development and production.

## Overview

Copy `.env.example` to `.env` and fill the variables appropriate for your environment.

- DATABASE_URL: PostgreSQL connection string (Neon, Supabase, Render, RDS, etc.)
- NEXTAUTH_URL / NEXTAUTH_SECRET: NextAuth core config
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET: Stripe API and webhook verification keys
- NEXT_PUBLIC_SITE_URL: Absolute origin used in metadata, robots, sitemap, JSON-LD
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

### Stripe (test or live)
- STRIPE_SECRET_KEY: `sk_test_...` (test) or `sk_live_...` (live)
- STRIPE_WEBHOOK_SECRET: `whsec_...` from Stripe CLI (dev) or Dashboard webhook (prod)

### SEO
- NEXT_PUBLIC_SITE_URL: Absolute origin for links, e.g. `https://yourdomain.com` in prod.

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
