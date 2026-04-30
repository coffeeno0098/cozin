import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

const statIcons: Record<string, string> = {
  Sales: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  Orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  Topups: "M12 6v12m6-6H6m15 0a9 9 0 11-18 0 9 9 0 0118 0z",
  Pending: "M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z",
  Products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  Stock: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

function formatDate(date: Date) {
  return date.toLocaleString("th-TH");
}

function getStockBadgeClass(status: "out" | "low" | "healthy") {
  if (status === "out") return "badge-error";
  if (status === "low") return "badge-warning";
  return "badge-success";
}

function getPaymentBadgeClass(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "badge-success";
  if (status === "rejected") return "badge-error";
  return "badge-warning";
}

export default async function AdminPage() {
  const currentUser = await requireAdmin();
  const dashboard = await getAdminDashboardData();

  const stats = [
    {
      label: "Sales",
      value: `${dashboard.salesSummary.totalSalesPoints} Point`,
      detail: "Fulfilled order value",
    },
    {
      label: "Orders",
      value: dashboard.salesSummary.orderCount,
      detail: "Total purchases",
    },
    {
      label: "Topups",
      value: `${dashboard.paymentSummary.verifiedTopupPoints} Point`,
      detail: `${dashboard.paymentSummary.verifiedTopupBaht} THB verified`,
    },
    {
      label: "Pending",
      value: dashboard.paymentSummary.pendingPaymentCount,
      detail: "Top-ups awaiting result",
    },
    {
      label: "Products",
      value: dashboard.productSummary.activeProductCount,
      detail: `${dashboard.productSummary.totalProductCount} total products`,
    },
    {
      label: "Stock",
      value: dashboard.stockSummary.availableCodes,
      detail: `${dashboard.stockSummary.soldCodes} sold, ${dashboard.stockSummary.reservedCodes} reserved`,
    },
  ];

  const adminLinks = [
    { label: "Products", description: "Add products, prices, maps, and visibility.", href: "/admin/products", primary: true },
    { label: "Game-Code Stock", description: "Add ID and password pairs ready for sale.", href: "/admin/codes", primary: true },
    { label: "Orders", description: "Review fulfilled purchases and delivered credentials.", href: "/admin/orders", primary: false },
    { label: "Payments", description: "Review TrueMoney top-ups and failed payment reasons.", href: "/admin/payments", primary: false },
    { label: "Users", description: "Review balances and apply audited Point adjustments.", href: "/admin/users", primary: false },
    { label: "Announcements", description: "Publish a scrolling customer announcement.", href: "/admin/announcements", primary: false },
    { label: "Audit Logs", description: "Review important admin actions.", href: "/admin/audit-logs", primary: false },
  ];

  return (
    <>
      <div className="global-nav">
        <Link href="/" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">
          Cozin
        </Link>
        <Link href="/account" className="text-nav-link opacity-85 hover:opacity-100">
          Back to Account
        </Link>
      </div>

      <main id="main-content" className="flex-1">
        <section className="tile-dark tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--text-muted-dark)]">
              <span translate="no">Cozin</span> Admin
            </p>
            <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-hero-display text-white">Store Dashboard</h1>
                <p className="text-body mt-2 text-[var(--text-muted-dark)]">
                  Signed in as {currentUser.username}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/codes" className="btn-pill-on-dark text-caption px-4 py-2">
                  Add Stock
                </Link>
                <Link href="/admin/products" className="btn-pill-ghost border-white/30 text-caption text-white hover:bg-white/10">
                  Manage Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`utility-card animate-fade-in-up ${i < 6 ? `delay-${i + 1}` : ""}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[var(--muted-foreground)]">
                    <path d={statIcons[stat.label]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-fine-print mt-3 text-[var(--muted-foreground)]">{stat.label}</p>
                  <p className="text-tagline tabular-nums mt-1">{stat.value}</p>
                  <p className="text-fine-print mt-2 text-[var(--muted-foreground)]">{stat.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
              <section className="utility-card animate-fade-in-up">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-body-strong">Low Stock</h2>
                    <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                      Active products with 5 or fewer available codes.
                    </p>
                  </div>
                  <Link href="/admin/codes" className="text-caption text-[var(--primary)] hover:underline underline-offset-4">
                    Add Codes
                  </Link>
                </div>

                {dashboard.lowStockProducts.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-3">
                    <p className="text-caption-strong">Stock looks healthy</p>
                    <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                      No active products are at or below the low-stock threshold.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    {dashboard.lowStockProducts.map((product) => (
                      <Link
                        key={product.id}
                        href="/admin/codes"
                        className="flex items-center justify-between gap-4 rounded-xl border border-[var(--hairline)] px-4 py-3 transition-colors hover:bg-[var(--surface-parchment)]"
                      >
                        <div className="min-w-0">
                          <p className="text-caption-strong truncate">{product.name}</p>
                          <p className="text-fine-print mt-1 text-[var(--muted-foreground)]">{product.gameMap}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={getStockBadgeClass(product.stockStatus)}>
                            {product.stockStatus === "out" ? "Out" : "Low"}
                          </span>
                          <p className="text-fine-print tabular-nums mt-1 text-[var(--muted-foreground)]">
                            {product.availableCodes} left
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="utility-card animate-fade-in-up delay-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-body-strong">Latest Orders</h2>
                    <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                      Most recent purchases.
                    </p>
                  </div>
                  <Link href="/admin/orders" className="text-caption text-[var(--primary)] hover:underline underline-offset-4">
                    View All
                  </Link>
                </div>

                {dashboard.latestOrders.length === 0 ? (
                  <p className="text-caption mt-5 text-[var(--muted-foreground)]">No orders yet.</p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {dashboard.latestOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-[var(--hairline)] px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-caption-strong truncate">{order.productName}</p>
                            <p className="text-fine-print mt-1 text-[var(--muted-foreground)]">
                              {order.username} / {order.gameMap}
                            </p>
                          </div>
                          <p className="text-caption-strong tabular-nums shrink-0">{order.pricePoints} Point</p>
                        </div>
                        <p className="text-fine-print mt-2 text-[var(--muted-foreground)]" suppressHydrationWarning>
                          {formatDate(order.createdAt)} / {order.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        <section className="tile-parchment tile-section">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_1fr]">
            <section className="utility-card animate-fade-in-up">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-body-strong">Latest Payments</h2>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                    Recent TrueMoney top-up attempts.
                  </p>
                </div>
                <Link href="/admin/payments" className="text-caption text-[var(--primary)] hover:underline underline-offset-4">
                  View All
                </Link>
              </div>

              {dashboard.latestPayments.length === 0 ? (
                <p className="text-caption mt-5 text-[var(--muted-foreground)]">No payments yet.</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {dashboard.latestPayments.map((payment) => (
                    <div key={payment.id} className="rounded-xl border border-[var(--hairline)] bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-caption-strong truncate">{payment.username}</p>
                            <span className={getPaymentBadgeClass(payment.status)}>{payment.status}</span>
                          </div>
                          <p className="text-fine-print mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <p className="text-caption-strong tabular-nums shrink-0">
                          {payment.pointsGranted} Point
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="utility-card animate-fade-in-up delay-1">
              <h2 className="text-body-strong">Admin Shortcuts</h2>
              <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                Common operating areas for running the store.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group rounded-xl border border-[var(--hairline)] bg-white px-4 py-3 transition-colors hover:bg-[var(--surface-parchment)]"
                  >
                    <p className="text-caption-strong">{link.label}</p>
                    <p className="text-fine-print mt-1 text-[var(--muted-foreground)]">{link.description}</p>
                    <span className={`text-fine-print mt-3 inline-flex ${link.primary ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} group-hover:text-[var(--primary)]`}>
                      Manage
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
