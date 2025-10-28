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
