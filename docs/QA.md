# Final QA Checklist

Use this checklist before releasing. Where possible, run checks against a production-like environment and database.

## 1) Navigation & i18n
- [ ] Root `/` redirects to `/fa` (first-visit) and sets `locale` cookie
- [ ] Language switcher toggles `/fa` ↔ `/en` and preserves query/hash
- [ ] `<html dir>` is `rtl` on `/fa/*` and `ltr` on `/en/*`
- [ ] All localized static pages render:
  - [ ] `/fa`, `/fa/about`, `/fa/contact`, `/fa/faq`, `/fa/terms`, `/fa/privacy`, `/fa/refund-policy`
  - [ ] `/en`, `/en/about`, `/en/contact`, `/en/faq`, `/en/terms`, `/en/privacy`, `/en/refund-policy`

## 2) Courses (DB-backed)
- [ ] `/fa/courses` and `/en/courses` list published courses
- [ ] Course detail renders (seeded slug e.g., `javascript-101`):
  - [ ] `/fa/courses/javascript-101`
  - [ ] `/en/courses/javascript-101`
- [ ] Images have `loading="lazy"` and `decoding="async"`
- [ ] JSON-LD present on course detail (`<script type="application/ld+json">`)

## 3) Cart & Checkout (Stripe or Zarinpal)
- [ ] Add to cart from course detail
- [ ] Checkout initiates the configured provider and shows correct price(s)
- [ ] Payment (test mode or live low-value) redirects to success page
- [ ] Stripe: Webhook processes `checkout.session.completed` and marks Order `PAID`
- [ ] Zarinpal: Callback verification marks Order `PAID`
- [ ] `OrderItem` entries exist; `Enrollment` created for purchased courses

## 4) Auth & Protected Content
- [ ] Sign-up and Sign-in flows work under `/fa/auth/*` and `/en/auth/*`
- [ ] Profile page shows session email and enrollments
- [ ] Protected asset route forbids non-enrolled users and allows enrolled ones
- [ ] Admin dashboard restricted to ADMIN role

## 5) SEO & Policies
- [ ] `/sitemap.xml` contains `fa` and `en` pages and course URLs, with absolute links
- [ ] `/robots.txt` includes `Sitemap: <origin>/sitemap.xml` and disallows `/en/admin`, `/fa/admin`, `/en/auth`, `/fa/auth`
- [ ] Canonical URLs (if emitted) point to production domain
- [ ] JSON-LD present on course detail, valid per Google Rich Results test
- [ ] Policy pages present and localized: Terms, Privacy, Refund Policy

## 6) Analytics
- [ ] With `NEXT_PUBLIC_ANALYTICS=ga`, GA snippet present and valid ID
- [ ] With `NEXT_PUBLIC_ANALYTICS=matomo`, Matomo snippet present with configured URL/site id
- [ ] With analytics disabled, no GA/Matomo scripts present

## 7) Configuration & Environment
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly in each environment (no mixed-domain canonicals)
- [ ] `NEXTAUTH_URL` matches public origin; `NEXTAUTH_TRUST_HOST=true` behind proxies/CDNs
- [ ] Stripe: Keys and webhook secret set for the environment (test vs live)

## 8) Backups & Ops
- [ ] Database backups enabled and retention verified
- [ ] Ops runbook ready for data recovery from Stripe and secret rotation

## Optional helper scripts
- Windows: `scripts\start-prod.ps1 -Port 3015 -SiteUrl "http://localhost:3015"`
- Quick page probe: `scripts\debug-fetch.ps1 -Url "http://localhost:3015/en/courses/javascript-101"`
- JSON-LD check (manual): view-source or fetch and search for `application/ld+json`
- Image attrs check (manual): look for `loading="lazy"` and `decoding="async"` on images

Record outcomes and screenshots where appropriate. File bugs with exact URL, locale, and repro steps.
