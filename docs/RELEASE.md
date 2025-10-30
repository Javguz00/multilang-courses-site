# Release Checklist

Use this checklist for each production release.

## Before releasing
- [ ] All migrations merged to `main` and reviewed
- [ ] `DATABASE_URL_PROD` secret set in GitHub (repo → Settings → Secrets → Actions)
- [ ] Vercel envs are complete (NEXTAUTH_URL/SECRET, NEXTAUTH_TRUST_HOST, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL)
- [ ] Stripe Dashboard webhook configured for `https://<domain>/api/stripe/webhook`
- [ ] Optional analytics envs (GA/Matomo) set appropriately
 - [ ] Confirm `NEXT_PUBLIC_SITE_URL` points to the exact production origin (https)

## Run production migrations
- Trigger GitHub Action "Run Prisma Migrations (Production)":
  - [ ] via Release → Publish a new release, or
  - [ ] via Actions → Run workflow (workflow_dispatch)
- Confirm job succeeded and migrations applied

## Deploy app
- [ ] Push tag/release to trigger Vercel (or manually deploy)
- [ ] Wait for Vercel deployment to complete

## Post-deploy verification
- [ ] Visit `https://<domain>/en` and `https://<domain>/fa`
- [ ] Open a seeded course page; add to cart; complete Stripe test checkout
- [ ] Verify redirect to `/checkout/success`
- [ ] Check DB rows created (Order=PAID, OrderItem, Enrollment)
- [ ] Verify `/sitemap.xml` and `/robots.txt` reference the correct host
- [ ] Verify `robots.txt` disallows `/en|fa/(admin|auth)` and has a `Sitemap:` pointing at your domain
- [ ] Verify analytics injection (if enabled) or absence (if disabled)
- [ ] Verify Course JSON-LD on course details
 - [ ] Spot-check canonical URLs and hreflang alternates (if configured) point to your domain

## Rollback (if needed)
- [ ] Revert to the previous Vercel deployment
- [ ] Consider `prisma migrate resolve` and a hotfix if a migration caused issues

## Notes
- The migrations job uses `secrets.DATABASE_URL_PROD`. Rotate it on credential changes.
- For long-running or destructive migrations, schedule a maintenance window and test on a staging clone first.

## Packaging reminders
- Use `scripts/package-archive.ps1` to create a distribution zip. It excludes: `node_modules/`, `.next/`, `.git/`, and `.env*` files to avoid bundling secrets.
- Never include `.env` or other secret-bearing files in archives or commits.

## Secret rotation (operational)
Rotate sensitive secrets periodically and on any suspected compromise:

- NEXTAUTH_SECRET: Rotate in your host, then redeploy. Verify sign-in/sign-out, session persistence, and callback flows.
- STRIPE_SECRET_KEY: Rotate in Stripe Dashboard and your host. Verify checkout and webhook delivery with test mode first.
- STRIPE_WEBHOOK_SECRET: Create a new Dashboard webhook secret, update envs, and confirm `checkout.session.completed` delivers successfully.
- Database credentials: Update `DATABASE_URL_PROD` (GitHub Actions secret) and Vercel envs; run a smoke test (health endpoints, simple DB query).

After each rotation, validate:
- Admin and auth routes behave correctly (no unexpected 401/403)
- Checkout succeeds in test mode and webhook updates orders/enrollments
- Logs show no signature verification errors for Stripe webhook
