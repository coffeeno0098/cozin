# Cozin Production Readiness Checklist

Use this checklist before opening the shop to real customers. Do not paste real secrets into this file.

## 1. Environment Variables

Set these in the production host:

- `DATABASE_URL`
  - Use the Supabase Postgres connection string.
  - Prefer the pooled connection string if the host creates many short-lived connections.
- `NEXT_PUBLIC_SUPABASE_URL`
  - Public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Supabase publishable/anon key only.
- `AUTH_SECRET`
  - Generate a strong production secret.
  - Never reuse a local development secret.
- `AUTH_URL`
  - Must be the final production URL, for example `https://cozin.example.com`.
- `TRUEMONEY_RECEIVER_PHONE`
  - TrueMoney receiver wallet phone number.

Before deploy, confirm `.env.example` still lists every required variable.

## 2. Database And Migrations

- Confirm all Drizzle migrations are committed.
- Run `npm run db:migrate` against the production database.
- Confirm these critical constraints exist:
  - `users.points >= 0`
  - unique `users.username`
  - unique `payments.externalReference`
  - unique `orders.gameCodeId`
  - index on `gameCodes.productId + status`
- Confirm RLS is enabled intentionally and policies do not block server-side app operations.
- Keep a copy of the production database connection details in a password manager, not in the repo.

## 3. Auth And Admin Access

- Create or promote the owner admin account.
- Verify admin pages reject customer accounts:
  - `/admin`
  - `/admin/products`
  - `/admin/codes`
  - `/admin/orders`
  - `/admin/payments`
  - `/admin/users`
  - `/admin/announcements`
  - `/admin/audit-logs`
- Verify server actions use server-side admin checks, not UI-only hiding.
- Confirm password policy remains at least 6 characters.

## 4. Money, Point, And Stock Smoke Test

Run this with a small real TrueMoney gift link:

- Login as a test customer.
- Confirm starting Point balance.
- Submit a TrueMoney gift link on `/topup`.
- Confirm payment becomes `verified`.
- Confirm Point increases by the gift amount.
- Buy a low-value test product.
- Confirm customer Point decreases.
- Confirm product stock decreases by 1.
- Confirm `/orders` shows the delivered ID and password.
- Confirm `/admin/orders` shows the order.
- Confirm `/admin/payments` shows the payment.

## 5. TrueMoney Failure Cases

Test or simulate these before launch:

- Invalid gift link.
- Already redeemed gift link.
- Receiver phone misconfiguration.
- Temporary TrueMoney/API failure.
- Duplicate voucher submit by the same user.
- Duplicate voucher submit by another user.

Expected behavior:

- No duplicate Point grants.
- No successful payment without a point transaction.
- Error messages should be readable for customer support.

## 6. Admin Operations

- Add at least one product.
- Add at least one game map.
- Add several game codes.
- Toggle product visibility.
- Create and disable an announcement.
- Adjust a test user's Point manually.
- Verify each important admin action appears in audit logs.
- Verify admin orders/payments search and status filters work.

## 7. Backups And Exports

Before accepting real money:

- Enable Supabase backups for the project plan.
- Decide how often to export:
  - orders
  - payments
  - point transactions
  - users
  - game code stock
- Decide whether exports should include full game passwords or masked passwords.
- Store exports securely because they may contain customer and credential data.

## 8. Observability And Logs

- Confirm production logs do not print:
  - raw TrueMoney voucher URLs
  - game passwords
  - database URLs
  - auth secrets
  - Supabase keys beyond public publishable keys
- Keep enough payment failure detail for support.
- Consider adding structured error reporting later if real traffic grows.

## 9. Deployment Smoke Test

After every production deploy:

- Open home page.
- Open `/products`.
- Login as customer.
- Open `/account`.
- Open `/topup`.
- Open `/orders`.
- Login as admin.
- Open `/admin`.
- Open `/admin/orders`.
- Open `/admin/payments`.
- Run one test purchase when the release changes money, stock, orders, or auth code.

## 10. Go/No-Go

Launch only when:

- `npm run lint` passes.
- `npm run build` passes.
- `npm test` passes.
- Database migrations are applied.
- Admin login works.
- Customer top-up and purchase flow works.
- Backup plan is clear.
- `.env.local` and other secret files are not tracked by Git.
