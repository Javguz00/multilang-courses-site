# Operations Guide

This guide covers operational tasks: backups/restores for Postgres and recovery steps from Stripe if data is lost.

## Backups and Restores (Postgres)

Use your provider’s built-in backups and PITR (point-in-time restore) when available. Quick links:

- Neon: Automated backups and PITR – https://neon.tech/docs/introduction/backup-restore
- Supabase: Backups and PITR – https://supabase.com/docs/guides/platform/backups
- Railway: Backups – https://docs.railway.app/guides/backups
- Render: Backups – https://render.com/docs/databases#backups

Recommended practices:
- Enable automated daily backups with at least 7–14 days retention.
- For schema changes, take a manual backup or snapshot before deploying migrations.
- Test restores to a staging database quarterly to validate your recovery plan.

### Restoring
- Restore to a new database instance (staging), not over the top of production.
- Run a smoke test to ensure schema and core queries work.
- Promote the restored instance only after validation, or cherry-pick the necessary data.

## Recovery from Data Loss: Reconciling from Stripe

If Orders or Enrollments are lost in the application database but Stripe has the payment records, you can reconstruct state:

1. Identify the time window and scope of the incident.
2. In Stripe Dashboard (or API), list successful Checkout Sessions or Payment Intents for that window (filter by metadata if you set it).
3. For each successful payment:
   - Determine the associated user (email from Checkout Session `customer_details.email`) and purchased course(s) (line items metadata or price/product mapping).
   - Recreate `Order` with status `PAID` and `OrderItem` rows.
   - Recreate `Enrollment` rows for each purchased course per user (respect the unique constraint per `userId, courseId`).
4. Record an `AuditLog` entry describing the recovery operation for traceability.

Tips:
- Build a one-off reconciliation script that calls Stripe’s API and replays `checkout.session.completed` events into your local handler or directly writes the DB rows.
- Keep the script idempotent by checking for existing orders/enrollments before insert.
- Test the script in staging first with a sanitized copy of data.

## Packaging in CI (macOS/Linux)

- Use the POSIX script: `npm run package:zip:sh` (requires `zip`).
- Ensure the CI image has the `zip` utility installed (Ubuntu `apt-get install zip -y`).
- The archive excludes `node_modules/`, `.next/`, `.git/`, and `.env*` files to avoid bundling secrets.

On Windows agents:
- Use `npm run package:zip:ps`.

## Secret Rotation

For rotation steps, see `docs/RELEASE.md` → Secret rotation (operational). Validate flows (auth, checkout, webhook) after each rotation.
