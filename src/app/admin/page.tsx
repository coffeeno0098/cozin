import { count, sql } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { adminAuditLogs, gameCodes, orders, payments, products, siteAnnouncements, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function getCount(
  table:
    | typeof users
    | typeof products
    | typeof gameCodes
    | typeof orders
    | typeof payments
    | typeof adminAuditLogs
    | typeof siteAnnouncements,
) {
  const [row] = await db.select({ value: count() }).from(table);

  return row.value;
}

const statIcons: Record<string, string> = {
  Users: "M15 19c0-2.21-2.686-4-6-4s-6 1.79-6 4m6-6a4 4 0 100-8 4 4 0 000 8zm10 6c0-1.657-1.791-3-4-3-.769 0-1.49.168-2.1.462M16 7a3 3 0 11-6 0 3 3 0 016 0z",
  Products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Game Codes": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  Payments: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "Audit Logs": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  Announcements: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
};

export default async function AdminPage() {
  const currentUser = await requireAdmin();

  const [userCount, productCount, codeCount, orderCount, paymentCount, auditLogCount, announcementCount] = await Promise.all([
    getCount(users),
    getCount(products),
    getCount(gameCodes),
    getCount(orders),
    getCount(payments),
    getCount(adminAuditLogs),
    getCount(siteAnnouncements),
  ]);

  const [stockSummary] = await db
    .select({
      available: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      sold: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reserved: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
    })
    .from(gameCodes);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Products", value: productCount },
    { label: "Game Codes", value: codeCount },
    { label: "Orders", value: orderCount },
    { label: "Payments", value: paymentCount },
    { label: "Audit Logs", value: auditLogCount },
    { label: "Announcements", value: announcementCount },
  ];

  const adminLinks = [
    { label: "Users", description: "Review customer balances and apply audited manual Point adjustments.", href: "/admin/users", primary: false },
    { label: "Products", description: "Add Roblox code products, set point prices, and toggle product visibility.", href: "/admin/products", primary: true },
    { label: "Game-Code Stock", description: "Add ID and password pairs to products. Available codes are ready to sell.", href: "/admin/codes", primary: false },
    { label: "Orders", description: "Review fulfilled purchases, delivered code credentials, and customer order history.", href: "/admin/orders", primary: false },
    { label: "Payments", description: "Review TrueMoney top-ups, verification status, granted points, and failed payment reasons.", href: "/admin/payments", primary: false },
    { label: "Announcements", description: "Publish a scrolling message for customers under the top navigation.", href: "/admin/announcements", primary: false },
    { label: "Audit Logs", description: "Review important admin actions such as product changes, map deletion, and code creation.", href: "/admin/audit-logs", primary: false },
  ];

  return (
    <>
      {/* ── Nav ── */}
      <div className="global-nav">
        <Link href="/" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">
          Cozin
        </Link>
        <Link href="/account" className="text-nav-link opacity-85 hover:opacity-100">
          Back to Account
        </Link>
      </div>

      <main id="main-content" className="flex-1">
        {/* ── Header (dark tile) ── */}
        <section className="tile-dark tile-section py-12">
          <div className="mx-auto max-w-5xl animate-fade-in-up">
            <p className="text-caption text-[var(--text-muted-dark)]">
              <span translate="no">Cozin</span> Admin
            </p>
            <h1 className="text-hero-display mt-1 text-white">Store Dashboard</h1>
            <p className="text-body mt-2 text-[var(--text-muted-dark)]">
              Signed in as {currentUser.username}
            </p>
          </div>
        </section>

        {/* ── Stats grid (white) ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`utility-card animate-fade-in-up ${i < 6 ? `delay-${i + 1}` : ""}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[var(--muted-foreground)]">
                    <path d={statIcons[stat.label]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-fine-print mt-3 text-[var(--muted-foreground)]">{stat.label}</p>
                  <p className="text-display-lg tabular-nums mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Admin links (parchment) ── */}
        <section className="tile-parchment tile-section">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adminLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`utility-card group block animate-fade-in-up ${i < 6 ? `delay-${i + 1}` : ""}`}
                >
                  <h2 className="text-body-strong">{link.label}</h2>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                    {link.description}
                  </p>
                  <span className={`text-caption mt-4 inline-flex items-center gap-1 ${link.primary ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} transition-colors group-hover:text-[var(--primary)]`}>
                    Manage →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stock overview (dark) ── */}
        <section className="tile-dark-2 tile-section">
          <div className="mx-auto max-w-5xl animate-fade-in-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-tagline text-white">Stock Overview</h2>
                <p className="text-caption mt-1 text-[var(--text-muted-dark)]">
                  Current game-code status across the store.
                </p>
              </div>
              <Link href="/admin/codes" className="btn-pill-on-dark text-caption px-4 py-2">
                Manage Stock
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                <p className="text-fine-print text-[var(--text-muted-dark)]">Available</p>
                <p className="text-display-lg tabular-nums mt-1 text-emerald-400">{stockSummary.available}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                <p className="text-fine-print text-[var(--text-muted-dark)]">Sold</p>
                <p className="text-display-lg tabular-nums mt-1 text-white">{stockSummary.sold}</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                <p className="text-fine-print text-[var(--text-muted-dark)]">Reserved</p>
                <p className="text-display-lg tabular-nums mt-1 text-amber-400">{stockSummary.reserved}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
