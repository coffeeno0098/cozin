import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { gameCodes, gameMaps, orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { normalizeAdminSearch, parseAdminOrderStatus } from "@/lib/admin-list-filters";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

function buildOrdersFilterHref(status: string | null, query: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/admin/orders?${search}` : "/admin/orders";
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = normalizeAdminSearch(params?.q);
  const status = parseAdminOrderStatus(params?.status);
  const conditions: SQL[] = [];

  if (status) {
    conditions.push(eq(orders.status, status));
  }

  if (query) {
    const likeQuery = `%${query}%`;
    const searchCondition = or(
      ilike(users.username, likeQuery),
      ilike(products.name, likeQuery),
      ilike(products.gameMap, likeQuery),
      ilike(gameMaps.name, likeQuery),
      ilike(gameCodes.gameAccountId, likeQuery),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const baseQuery = db
    .select({
      id: orders.id,
      pricePoints: orders.pricePoints,
      status: orders.status,
      createdAt: orders.createdAt,
      username: users.username,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      gameAccountId: gameCodes.gameAccountId,
      gamePassword: gameCodes.gamePassword,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(products, eq(orders.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .innerJoin(gameCodes, eq(orders.gameCodeId, gameCodes.id));

  const orderRows = await (whereClause ? baseQuery.where(whereClause) : baseQuery)
    .orderBy(desc(orders.createdAt))
    .limit(100);
  const hasFilters = Boolean(query || status);
  const statusTabs = [
    { label: "All", value: null },
    { label: "Fulfilled", value: "fulfilled" },
    { label: "Paid", value: "paid" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <>
      <div className="global-nav">
        <Link href="/admin" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">Cozin Admin</Link>
        <Link href="/admin" className="text-nav-link opacity-85 hover:opacity-100">← Dashboard</Link>
      </div>

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Orders</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Latest purchases and delivered code details.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="utility-card animate-fade-in-up">
              <form className="flex flex-col gap-3 md:flex-row md:items-end" action="/admin/orders">
                <div className="flex-1">
                  <label htmlFor="order-q" className="text-fine-print text-[var(--muted-foreground)]">
                    Search
                  </label>
                  <input
                    id="order-q"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Username, product, map, or delivered ID"
                    className="mt-1 w-full rounded-xl border border-[var(--hairline)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                </div>
                {status ? <input type="hidden" name="status" value={status} /> : null}
                <button type="submit" className="btn-pill text-caption px-4 py-2.5">
                  Search
                </button>
                {hasFilters ? (
                  <Link href="/admin/orders" className="btn-pill-ghost text-caption px-4 py-2.5 text-center">
                    Clear
                  </Link>
                ) : null}
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {statusTabs.map((tab) => {
                  const active = tab.value === status;
                  return (
                    <Link
                      key={tab.label}
                      href={buildOrdersFilterHref(tab.value, query)}
                      className={active ? "badge-success" : "badge-neutral"}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {orderRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">{hasFilters ? "No Matching Orders" : "No Orders Yet"}</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  {hasFilters ? "Try another search or clear the current filters." : "Customer purchases will appear here."}
                </p>
              </div>
            ) : (
              orderRows.map((order, i) => (
                <article key={order.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-caption text-[var(--muted-foreground)]">{order.username}</p>
                      <h2 className="text-body-strong mt-1 truncate">{order.productName}</h2>
                      <p className="text-fine-print mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                        {order.gameMap} · {order.createdAt.toLocaleString("th-TH")} · {order.status}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Paid</p>
                      <p className="text-body-strong tabular-nums">{order.pricePoints} Point</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-3">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Delivered ID</p>
                      <p className="text-caption-strong mt-1 break-all">{order.gameAccountId}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-3">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Delivered Password</p>
                      <p className="text-caption-strong mt-1 break-all">{order.gamePassword}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
