import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { gameCodes, gameMaps, orders, products } from "@/db/schema";

type OrdersPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const orderRows = await db
    .select({
      id: orders.id,
      pricePoints: orders.pricePoints,
      status: orders.status,
      createdAt: orders.createdAt,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      gameAccountId: gameCodes.gameAccountId,
      gamePassword: gameCodes.gamePassword,
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .innerJoin(gameCodes, eq(orders.gameCodeId, gameCodes.id))
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <>
      {/* ── Nav ── */}
      <SiteNav />

      <main id="main-content" className="flex-1">
        {/* ── Header (parchment) ── */}
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]">
              <span translate="no">Cozin</span> Account
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-display-lg">Purchase History</h1>
              <Link href="/products" className="btn-pill-ghost text-caption px-4 py-2">
                Browse Products
              </Link>
            </div>
          </div>
        </section>

        {/* ── Orders ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl space-y-5">
            <div aria-live="polite">
              {params?.success ? (
                <div className="alert-success animate-fade-in">
                  Purchase completed. Your code is available below.
                </div>
              ) : null}
            </div>

            {orderRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">No Purchases Yet</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  Purchased codes will appear here.
                </p>
              </div>
            ) : (
              orderRows.map((order, i) => (
                <article
                  key={order.id}
                  className={`utility-card animate-fade-in-up ${i < 6 ? `delay-${i + 1}` : ""}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-caption text-[var(--muted-foreground)]">
                        {order.gameMap}
                      </p>
                      <h2 className="text-body-strong mt-1">{order.productName}</h2>
                      <p
                        className="text-fine-print mt-1 text-[var(--muted-foreground)]"
                        suppressHydrationWarning
                      >
                        {order.createdAt.toLocaleString("th-TH")} · {order.status}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Paid</p>
                      <p className="text-body-strong tabular-nums">{order.pricePoints} Point</p>
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-3">
                      <p className="text-fine-print text-[var(--muted-foreground)]">ID</p>
                      <p className="text-body-strong mt-1 break-all">{order.gameAccountId}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-3">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Password</p>
                      <p className="text-body-strong mt-1 break-all">{order.gamePassword}</p>
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
