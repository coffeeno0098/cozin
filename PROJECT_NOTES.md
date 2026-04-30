# Cozin Project Notes

## Purpose

Cozin is an owner-run Roblox code shop. Customers top up Point with a TrueMoney gift link, then use Point to buy Roblox game account/code products. Purchased credentials appear in purchase history after checkout.

Use this file as the project memory for future Codex chats. Add short notes here whenever product rules, design decisions, backend assumptions, or important keywords change.

## Current Keywords

- Cozin
- Roblox code shop
- Point wallet
- TrueMoney gift link
- 1 baht = 1 Point
- game maps
- products
- game codes / stock
- purchase history
- admin dashboard
- audit logs
- owner-run shop
- Next.js 16 App Router
- Drizzle ORM
- Supabase/Postgres
- NextAuth/Auth.js

## Current System Shape

- Public users can browse products before logging in.
- Registered users can top up Point, buy products, and view purchase history.
- Admin users can manage products, maps, codes, users, payments, orders, announcements, and audit logs.
- The visual direction is a polished Apple-inspired storefront using `DESIGN.md`, `src/app/globals.css`, and `public/logo.png`.
- Fonts should use `next/font/google`; avoid raw Google Font `<link>` tags in `app/layout.tsx`.
- The home page Add Point CTA should send signed-in users to `/topup` and guests to `/login`.

## Backend Baseline Observed

- Product purchase already runs inside a database transaction.
- Purchase flow locks the user row with `for update`.
- Purchase flow selects an available code with `for update skip locked`.
- Purchase flow updates user points, marks the code sold, creates an order, and writes a point transaction in one transaction.
- Purchase transaction logic lives in `src/lib/purchase.ts` and has regression tests in `src/lib/purchase.test.ts`.
- Top-up flow extracts a TrueMoney voucher code and stores it as `payments.externalReference`.
- `payments.externalReference` has a unique index to prevent voucher reuse.
- Top-up success updates user points, payment status, and point transaction inside a transaction.
- Existing top-up payment retry/duplicate decisions live in `src/lib/topup-safety.ts` and have regression tests in `src/lib/topup-safety.test.ts`.
- Admin dashboard summary queries live in `src/lib/admin-dashboard.ts`.
- Low-stock status uses `LOW_STOCK_THRESHOLD = 5` and is covered by `src/lib/admin-dashboard.test.ts`.
- Verified top-up point grants live in `src/lib/topup.ts` and are covered by transaction tests.
- Admin orders/payments list filter parsing lives in `src/lib/admin-list-filters.ts`.
- Admin server actions use `requireAdmin()`.
- Admin changes write `adminAuditLogs`, with metadata sanitization for sensitive keys.
- Tests currently cover auth validation, admin validation, admin audit sanitization, rate limit behavior, and TrueMoney helpers.

## Backend Hardening Plan

### Phase 1: Safety Audit Before More UI Work

Goal: verify that money, stock, and admin permissions are hard to break before focusing fully on frontend polish.

1. Purchase safety
   - Done: extracted and tested `purchaseProduct` behavior for missing records, not enough points, no stock, successful purchase, user lock, and `skipLocked` stock lock.
   - Still useful later: integration/concurrency test against a real Postgres database for the last-stock purchase case.
   - Confirm an order can never be created without a sold code and point transaction.

2. Top-up safety
   - Done: tested duplicate/processing/retry decisions for existing voucher payments.
   - Done: verified vouchers are blocked, pending vouchers show processing, another user's rejected voucher is duplicate, and same-user temporary failures can retry.
   - Consider storing a normalized voucher code or hashed voucher code if privacy becomes important.

3. Admin authorization
   - Confirm every admin page and server action uses server-side admin checks, not UI-only hiding.
   - Add a lightweight regression test or helper pattern if possible.

4. Audit coverage
   - Confirm audit logs exist for product create/toggle, code create, map delete, point adjust, announcement create/toggle.
   - Decide whether payment/order administrative actions need explicit audit events later.

5. Data protection
   - Review where game account IDs/passwords are displayed.
   - Keep credentials visible to the buyer and necessary admins only.
   - Avoid putting raw vouchers, passwords, or tokens into logs/audit metadata.

### Phase 2: Admin Operating Tools

Goal: make the shop owner faster and safer day-to-day.

1. Dashboard summary
   - Done: `/admin` now shows sales, order count, verified top-ups, pending payments, active products, available stock, latest orders, latest payments, and low-stock products.

2. Low-stock workflow
   - Done: dashboard surfaces active products with 5 or fewer available codes.
   - Done: dashboard includes Add Stock / Manage Stock links to `/admin/codes`.
   - Still useful later: add product-specific quick-add code flows or filters on `/admin/codes`.

3. Export/backup
   - Export orders, payments, users, point transactions, and code stock as CSV.
   - Decide whether exported game passwords should be included, masked, or admin-gated.

4. Manual support tools
   - Search user by username/email.
   - Search order/payment by id.
   - Clear support view of user balance ledger.

### Phase 3: Production Readiness

Goal: reduce operational surprises once real money/users exist.

1. Environment/config check
   - Fail clearly when required env vars are missing.
   - Keep `.env.example` up to date.

2. Rate limits
   - Review current in-memory rate limits.
   - Move to persistent/Redis-backed limits if deploying across multiple server instances.

3. Database maintenance
   - Confirm migrations are committed and reproducible.
   - Document backup/restore path.

4. Observability
   - Add structured error reporting later if needed.
   - Keep sensitive values out of logs.

## Next Recommended Work Order

1. Backend safety audit and focused tests for purchase/top-up/admin guards.
2. Add admin dashboard summary and low-stock visibility.
3. Add export/backup tools.
4. Then focus heavily on frontend UX: mobile, purchase flow clarity, top-up feedback, admin ergonomics.

## Open Decisions

- Should admin exports include full game passwords or masked passwords?
- Should rejected TrueMoney vouchers be retryable forever, retryable only for specific error codes, or locked after first failure?
- Should product stock low threshold be fixed at 5, configurable per product, or dashboard-only?
- Should all UI text be Thai, English, or mixed as currently?

## Changelog

- 2026-05-01: Added project memory file and backend hardening plan after storefront redesign review.
- 2026-05-01: Started backend hardening by extracting purchase/top-up safety helpers and adding regression tests for money/stock/duplicate-voucher behavior.
- 2026-05-01: Added admin dashboard summary helper, low-stock threshold tests, and upgraded `/admin` with operating metrics, latest orders/payments, and stock alerts.
- 2026-05-01: Extracted verified top-up transaction logic into a tested helper and added search/status filters to admin orders/payments.
