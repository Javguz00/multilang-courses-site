# Deployment to Vercel

This guide walks through deploying the project on Vercel with a managed Postgres (Neon/Supabase/Render) and Stripe webhook setup.

## Prerequisites
- GitHub repository connected to Vercel
- Stripe account (test mode is fine)
- Managed Postgres (Neon recommended) or your own PostgreSQL

## 1) Provision the database
- Create a new Postgres database (Neon/Supabase/etc.)
- Copy the connection string (prefer pooled connection for serverless)
- Example: `postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public&pgbouncer=true&connection_limit=1`

## 2) Configure Vercel Environment Variables
In Vercel → Project Settings → Environment Variables (Production + Preview):

Required
- DATABASE_URL → your managed Postgres connection string
- NEXTAUTH_URL → `https://yourdomain.com`
- NEXTAUTH_SECRET → strong random string
- NEXTAUTH_TRUST_HOST → `true` (recommended when behind proxies/CDNs)
- STRIPE_SECRET_KEY → `sk_live_...` (or `sk_test_...` while testing)
- STRIPE_WEBHOOK_SECRET → `whsec_...` (filled in step 4)
- NEXT_PUBLIC_SITE_URL → `https://yourdomain.com`

Optional
- Analytics: GA or Matomo variables
- Email (SMTP) variables
- ALLOWED_ORIGINS (if you use multiple origins)

See the environment matrix in `docs/CONFIGURATION.md` for Production vs Preview vs Development differences.

## 3) Run production migrations
Use Prisma migrate deploy against the production DB. You can run it locally targeting the prod DATABASE_URL or in CI/CD.

Locally (replace with your prod DATABASE_URL):

```
# Powershell
$env:DATABASE_URL="<your-prod-db>"; npx prisma migrate deploy
```

Or add a Vercel build step (not recommended for long migrations). Prefer running migrations before you deploy.

## 4) Stripe webhook
- Runtime: Ensure the webhook route runs on the Node.js runtime (not Edge). Edge runtimes do not expose the raw request body needed for Stripe signature verification.
- Raw body: The handler should read the raw string (e.g., `await request.text()`) and pass it with `Stripe-Signature` to `stripe.webhooks.constructEvent`. Avoid JSON body parsing or wrappers that mutate the payload before signature verification.
- In Stripe Dashboard → Developers → Webhooks → Add endpoint
- Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
- Select events for Checkout / Payment Intent (e.g., `checkout.session.completed`, `payment_intent.payment_failed`)
- Create the endpoint and copy the signing secret `whsec_...`
- Paste it in Vercel → Environment Variables: `STRIPE_WEBHOOK_SECRET`

Testing production (test mode)
- Temporarily use test keys and test cards to check the flow
- Switch to live keys when ready

### Switching from Test to Live mode (Stripe)
1. Replace `STRIPE_SECRET_KEY` with your live key `sk_live_...` in Vercel envs (Production).
2. Create a new webhook endpoint in the Stripe Dashboard (Live mode) pointing to `https://yourdomain.com/api/stripe/webhook` and copy its live `whsec_...`.
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel (Production) with the live secret.
4. Redeploy the app to pick up new envs.
5. Perform a low-value live test (e.g., $1) or a $0 authorization if applicable. Verify webhook deliveries and DB updates (Order → PAID, Enrollment created).
6. Remove any preview/test endpoints from the live environment to avoid confusion.

## 5) Deploy
- Push to `main` (or your deployment branch)
- In Vercel, trigger a deployment

## 6) Post-deploy verification checklist
- Open `https://yourdomain.com/en` and `https://yourdomain.com/fa`
- Visit `/en/courses` → open a course → add to cart → checkout → pay with test card
- Ensure redirect to `/en/checkout/success` and database rows (`Order`, `OrderItem`, `Enrollment`) are created
- Check `/sitemap.xml` and `/robots.txt` are correct (host matches NEXT_PUBLIC_SITE_URL)
- Confirm `robots.txt` disallows admin/auth for both locales: `/en/admin`, `/fa/admin`, `/en/auth`, `/fa/auth`; and has a `Sitemap:` line pointing at your domain
- Verify analytics present (GA or Matomo) if enabled; absent otherwise
- Verify Course JSON-LD present on course detail pages
- Optional (international SEO): verify hreflang alternates are emitted where applicable (fa/en equivalents). You can implement per-page `alternates.languages` via Next.js Metadata to output `<link rel="alternate" hreflang=...>` tags; ensure both locale URLs appear in the sitemap as well.

## Troubleshooting
- 500 on `/api/stripe/webhook`: ensure your `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- 307 redirect to `/en/courses` on detail pages: check that the database is migrated and seeded; the slug must exist
- Rate limits or CSRF blocks in admin deletes: set proper `ALLOWED_ORIGINS` or adjust policy
