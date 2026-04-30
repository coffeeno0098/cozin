import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import { gameCodes, gameMaps, orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orderRows = await db
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
    .innerJoin(gameCodes, eq(orders.gameCodeId, gameCodes.id))
    .orderBy(desc(orders.createdAt))
    .limit(100);

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
            {orderRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">No Orders Yet</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">Customer purchases will appear here.</p>
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
