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
