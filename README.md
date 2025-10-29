# Multilingual Programming Courses Store (MVP Scaffold)

A simple, multilingual website to sell programming courses. Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, basic i18n (fa/en), extensible architecture for cart, checkout, auth, and content protection.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- next-intl (planned, later subtasks)

## Structure
```
app/
  globals.css
  layout.tsx
  page.tsx
  components/
  lib/
public/
styles/
```

## Scripts
- dev: Run development server
- build: Production build
- start: Start production server
- lint: Lint code
- typecheck: TypeScript checks
- test / test:e2e: Run Playwright end-to-end tests (starts the dev server automatically)
- test:e2e:ui: Run Playwright tests in UI mode

## Getting Started
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000

## E2E tests (Playwright)
1. Install browsers once:
  - `npx playwright install`
2. Run tests:
  - `npm run test` (headless)
  - `npm run test:e2e:ui` (UI mode)

What’s covered:
- Redirect `/` → `/fa` and `locale` cookie set
- `<html dir>` is `rtl` on `/fa` and `ltr` on `/en`
- Locale switcher preserves query string and hash
- Localized routes: `/fa|en/(courses|contact)` render

## Database (PostgreSQL with Prisma)

Prisma is configured for PostgreSQL. Provide a valid `DATABASE_URL` via environment variables.

1) Configure env
- Copy `.env.example` to `.env`
- Set `DATABASE_URL` to your Postgres connection string, e.g.
  - `postgresql://postgres:postgres@localhost:5432/multilang_courses?schema=public`

2) Install Prisma and generate client
```
npm install
npx prisma generate
```

3) Create database schema (dev)
```
npx prisma migrate dev --name init
```

4) Seed sample data
```
npm run db:seed
```
- Expected console output: `Seed completed: { users: 2, courses: 2, orderId: <id> }`

5) Inspect DB
- Verify tables exist: User, Course, Category, Order, OrderItem, Enrollment, Coupon, Review
- Confirm seeded rows for categories, users, courses, an order, enrollment, and a review

### Vercel deployment notes
- Set `DATABASE_URL` in Vercel Project Settings → Environment Variables (Production/Preview as needed)
- Avoid running `prisma migrate dev` during runtime. Run migrations via CI or locally against the production DB prior to deploy
- Ensure `npx prisma generate` runs during build (automatically handled by `postinstall`/`prisma generate` when dependencies install)

## Authentication (NextAuth Credentials)

Environment variables (add to your `.env`):
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=...` (use a strong random string)

Routes and pages:
- API: `/api/auth/[...nextauth]` – NextAuth handler
- Sign up: `/{locale}/auth/sign-up` – creates user (hashed password)
- Sign in: `/{locale}/auth/sign-in` – credentials login
- Profile (protected): `/{locale}/profile` – redirects to sign-in if not authenticated
- Header displays session status (email) and offers sign in/out links

Steps to try locally:
1) Ensure DB is migrated and seeded (see Database section)
2) Set NEXTAUTH_URL and NEXTAUTH_SECRET in `.env`
3) Start dev server: `npm run dev`
4) Visit `/fa/auth/sign-up` to create a user, then `/fa/auth/sign-in` to log in
5) Check header shows your email and `/fa/profile` renders it; try the same under `/en/...`

### Password policy and hashing
- Minimum password length: 6 characters (MVP). For production, increase to 8–12 and add complexity rules as needed.
- Passwords are hashed with bcrypt using 10 salt rounds (`bcrypt.hash(password, 10)`). You can raise this for stronger security at the cost of CPU.

### Redirects for unauthenticated users
- Protected pages (e.g., `/{locale}/profile`) redirect to `/{locale}/auth/sign-in` when not signed in.
- A `callbackUrl` query param is provided so, after successful sign-in, users are sent back to the original page.
- To customize, change the redirect target or `callbackUrl` logic inside your server components/handlers.

### Anti-abuse note (MVP)
- The registration endpoint implements a basic per-IP rate limit (default: 5 requests/min). For production, consider a distributed limiter (Redis) and CAPTCHA.

### NextAuth production cookies & security
- Set `NEXTAUTH_URL` to your public HTTPS URL in production, e.g. `https://example.com`.
- Ensure `NEXTAUTH_SECRET` is set to a strong random string.
- Cookies are automatically marked `secure` when `NEXTAUTH_URL` is HTTPS. Keep `SameSite=Lax` unless you have cross-site flows.
- If you’re behind a reverse proxy or platform that alters host headers, set `NEXTAUTH_TRUST_HOST=1` and make sure `x-forwarded-*` headers are forwarded correctly.
- If using subdomains and you need session sharing, consider configuring a cookie domain (e.g., `.example.com`) via NextAuth cookies config.

### Test credentials (for QA)
- After running `npx prisma migrate dev` and `npm run db:seed`, a test account is available:
  - Email: `test@example.com`
  - Password: `Password123!`
- Alternatively, create a user via the sign-up form at `/{locale}/auth/sign-up` and then sign in at `/{locale}/auth/sign-in`.

### Admin access
- Seeded admin user (after migrate + seed):
  - Email: `admin@example.com`
  - Password: `Admin123!`
- Admin dashboard: `/{locale}/admin` (protected). Only users with `role = ADMIN` can access.
- Manage:
  - Courses: list, create, edit, delete (fields: title, price, short description, syllabus, media URL, category, published)
  - Categories: create, update, delete
- Note: After editing data via the dashboard, server actions will revalidate the admin pages automatically.

### Price input (Decimal) and normalization
- Admin forms expect monetary values with a dot as the decimal separator (e.g., `49.00`).
- To avoid locale-specific issues, inputs are normalized on the server: whitespace is removed and commas are converted to dots before validation.
- Validation requires a number with up to 2 decimal places. Examples accepted: `10`, `10.5`, `10.50`. Examples rejected: `10,5.2`, `10.500`, `10..5`.

### CSRF origin checks for destructive actions
- Destructive admin actions (e.g., deletions) enforce a basic CSRF origin check.
- In development, all origins are allowed to ease local testing.
- In production, the `origin` header must match either:
  - `NEXTAUTH_URL` (protocol and host), or
  - Any URL listed in `ALLOWED_ORIGINS` (comma-separated), e.g. `https://admin.example.com,https://app.example.com`.
- Ensure `NEXTAUTH_URL` is set to your public HTTPS URL, and optionally set `ALLOWED_ORIGINS` for multi-domain setups or admin subdomains.

Notes on allowed origins:
- Exact matches only (protocol + host). Wildcards are NOT supported (e.g., `https://*.example.com` won’t match).
- Examples:
  - Allowed: `NEXTAUTH_URL=https://app.example.com` → origin must be exactly `https://app.example.com`
  - Allowed: `ALLOWED_ORIGINS=https://admin.example.com,https://app.example.com`
  - Not supported: `ALLOWED_ORIGINS=https://*.example.com`

### Audit logging
- Admin mutations (create/update/delete for categories and courses) are written to an `AuditLog` table with user id, action, entity, entity id, and optional metadata.
- To apply the schema: run Prisma migrate/generate as described below.

### Language filtering (canonical)
- The canonical field for language is a single string column `Course.language` (optional).
- Previous drafts considered `languageTags: string[]`; this is not used. If you need multi-language tags later, add a separate relation or array field and update filters accordingly.

GDPR/PII considerations:
- Avoid storing sensitive personal data inside `meta`.
- Prefer IDs and minimal context (e.g., `{ slug: "js-101" }`) over full payloads.
- Restrict access to audit logs to authorized staff only.

### After schema updates (types)
- Whenever you change `prisma/schema.prisma`, run:
  - `npx prisma migrate dev`
  - `npx prisma generate`
- This refreshes generated types so you can remove temporary `as any` casts inside admin server actions/pages (added to keep typechecks passing between schema changes and local generation).
  
New models in this iteration:
- `AuditLog` – stores admin mutation logs
- `CourseAsset` – per-course videos/files for protected content delivery

Additional constraints:
- `Review`: `@@unique([userId, courseId])` to prevent duplicate reviews per user per course

### Admin link visibility
- The header shows an “Admin” link only when the current session user has `role = ADMIN`. Non-admin users won’t see it and will be redirected if they try to access `/admin` URLs directly.

## Commerce & Stripe (local testing)
### Protected assets: redirects vs. signed URLs

For this MVP, the protected asset route (`/api/courses/[courseId]/assets/[assetId]`) performs an authorization check (user must be enrolled) and then issues a 302 redirect to the remote asset URL. This is simple and fast, but it has limitations:

- Anyone who receives the destination URL can share it and bypass your app entirely.
- Redirects do not prevent hotlinking or long-term reuse if the URL is public and long-lived.

For stronger protection in a future iteration, consider one of these approaches:

- Private object storage + short-lived signed URLs (S3 pre-signed URLs, GCS Signed URLs, Azure SAS). The API route issues a signed URL only after access checks. Links expire quickly (e.g., 1–5 minutes) and are bound to the object path.
- Reverse proxy/streaming via the app or an edge function. The route streams the file or video (with Range support) after validating access, so the origin is never exposed. This costs more CPU/bandwidth but keeps URLs private.

Either approach can be combined with watermarking and/or token-based anti-hotlinking at the CDN layer.
### Refunds and partial reimbursements (operational guidance)

- Stripe refunds: Initiate refunds in the Stripe Dashboard or via API. Webhook events (`charge.refunded`, `payment_intent.canceled`) should be handled to reflect state.
- Orders: Mark the corresponding `Order` as `REFUNDED` (full) or introduce a new status such as `PARTIALLY_REFUNDED` for partial refunds.
- Enrollments: For full refunds, consider removing or deactivating the user's `Enrollment` records for refunded courses. For partial refunds (some items), remove only those course enrollments.
- Auditing: Record a line in `AuditLog` (operator and reason) to preserve a trail.
- Next phase: Add a dedicated refunds handler that validates ownership and refund eligibility, and processes side-effects idempotently.

1) Environment variables

- Copy `.env.example` to `.env` and set:
  - `DATABASE_URL` → your Postgres connection string
  - `NEXTAUTH_URL=http://localhost:3000` (or your dev URL)
  - `NEXTAUTH_SECRET=...` strong random value
  - `STRIPE_SECRET_KEY=sk_test_...` (from Stripe dashboard → Developers → API keys)
  - `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe CLI `stripe listen` or Dashboard webhook)
  - Optional currency overrides: `DEFAULT_CURRENCY`, `CURRENCY_EN`, `CURRENCY_FA`
  - Optional email sending: set `EMAIL_ENABLED=true` and `SMTP_*` variables (see `.env.example`)

2) Apply schema and generate client

```
npx prisma migrate dev
npx prisma generate
```

3) Start dev server

```
npm run dev
```

4) Stripe webhook in dev

Use the Stripe CLI to forward events to your local webhook handler:

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_...` to `STRIPE_WEBHOOK_SECRET` in your `.env`.

5) Test checkout flow

- Visit `/{locale}/courses/[slug]` → Add to cart
- Go to `/{locale}/cart` → Checkout
- You’ll be redirected to Stripe Checkout. Use a test card (e.g. `4242 4242 4242 4242`, any future expiry, any CVC)
- On success, you’ll be redirected to `/{locale}/checkout/success`
- On cancel, you’ll be redirected to `/{locale}/checkout/cancel` and the cart is retained

6) Verify database state

- `Order` should be `PAID`
- `OrderItem` rows created for each course purchased
- `Enrollment` rows created (unique per `userId, courseId`)

7) Verify email (optional)

- If `EMAIL_ENABLED=true` and SMTP vars are set, a minimal order confirmation email is sent
- If disabled or misconfigured, sending is skipped (logged) to keep the webhook fast and reliable

8) Stripe Dashboard

- Check Developers → Webhooks for successful event deliveries
- Retries on transient failures are automatic; the endpoint is idempotent for enrollments

## My Enrollments

- Authenticated users can view their purchased courses at `/{locale}/profile/enrollments`
- If not logged in, users are redirected to `/{locale}/auth/sign-in` with a callback back to enrollments


## Roadmap (aligned with execution plan)
- i18n & RTL (fa/en with locale switcher)
- Data model & sample courses
- Core UI (Home, Courses, Course Detail)
- Cart & Checkout (mock + adapters for Zarinpal/IDPay/Stripe)
- Auth & protected content
- Static pages (About, Contact, FAQ, Terms, Privacy, Refund)
- SEO & Analytics
- Packaging & Deployment guide

## Notes
This is the initial scaffold. Functional features will be implemented in subsequent subtasks.

## Marketing pages and blog

Static, localized marketing pages live under the locale folders:

- English: `app/en/(about|contact|faq|terms|privacy|refund-policy)`
- Persian (fa): `app/fa/(about|contact|faq|terms|privacy|refund-policy)`

The Contact pages include a client-only form stub (no backend). It simulates a send and shows a confirmation banner.

Blog routes are locale-aware under `app/[locale]/blog`:

- List: `/{locale}/blog`
- Post: `/{locale}/blog/[slug]`

Sample posts are defined in `lib/blog.ts` with localized copies (same slug per locale). Update this file to add or edit posts.
