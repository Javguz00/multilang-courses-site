# Delivery Summary

This package includes the complete source code for the Multilingual Programming Courses site, documentation, and cross-platform packaging scripts.

## Where is the distributable?

- A ready-to-share zip archive was generated at:
  - `c:\workspace\MindriftProyects\multilang-courses-site.zip`
- The archive excludes `node_modules/`, `.next/`, `.git/`, and `.env*` files to avoid bundling secrets. Rebuild after extracting.
- You can regenerate the archive any time:
  - Windows: `npm run package:zip:ps`
  - macOS/Linux: `npm run package:zip:sh`

## Repository access (make public)

If your client sees 404 on GitHub, the repository is set to Private. To make it public:
1) Open GitHub → repository page → Settings → General → Danger Zone
2) "Change repository visibility" → Public → Confirm
3) Share the repo link again: `https://github.com/Javguz00/multilang-courses-site`

If you prefer to share a zip instead, attach `multilang-courses-site.zip` to your delivery platform.

## How to run (local)

1) Copy `.env.example` to `.env` and fill values (see `docs/CONFIGURATION.md` env matrix)
2) Install deps and generate client
```
npm install
npx prisma generate
```
3) Apply schema and seed sample data
```
npx prisma migrate dev
npm run db:seed
```
4) Start dev server and open http://localhost:3000
```
npm run dev
```
5) Production-like start (Windows helper)
```
./scripts/start-prod.ps1 -Port 3005 -SiteUrl "http://localhost:3005"
```

## Deployment

Use `docs/DEPLOYMENT.md` (Vercel) and `docs/RELEASE.md` (checklist). Set environment variables per the matrix in `docs/CONFIGURATION.md`.

## QA and Operations

- `docs/QA.md`: Final QA checklist (navigation, i18n, DB pages, Stripe checkout, webhook, SEO, policies)
- `docs/OPERATIONS.md`: Backups/restores references and recovery steps from Stripe

## Scope note

This scaffold includes optional, production-ready building blocks (auth, Prisma/Postgres, Stripe checkout, admin CRUD, audit logging, security, SEO/analytics). If the client wants a minimal site (static pages + basic i18n) without auth/DB/Stripe, we can produce a simplified branch that keeps only the localized marketing pages and blog. Share your preference and we will deliver that pared-down variant.
