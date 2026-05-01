import { asc, desc, eq, sql } from "drizzle-orm";

import { createCodeAction } from "@/app/admin/actions";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type CodesPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getStatusBadge(status: "available" | "reserved" | "sold") {
  if (status === "available") return "badge-success";
  if (status === "reserved") return "badge-warning";
  return "badge-neutral";
}

function getStockBadge(availableCodes: number) {
  if (availableCodes === 0) return { label: "Out of stock", badgeClass: "badge-error" };
  if (availableCodes <= 2) return { label: "Low stock", badgeClass: "badge-warning" };
  return { label: "Ready", badgeClass: "badge-success" };
}

export default async function CodesPage({ searchParams }: CodesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      isActive: products.isActive,
      availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      soldCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reservedCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
      totalCodes: sql<number>`coalesce(count(${gameCodes.id}), 0)::int`,
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.name));

  const codeRows = await db
    .select({
      id: gameCodes.id,
      gameAccountId: gameCodes.gameAccountId,
      status: gameCodes.status,
      createdAt: gameCodes.createdAt,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
    })
    .from(gameCodes)
    .innerJoin(products, eq(gameCodes.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .orderBy(desc(gameCodes.createdAt))
    .limit(30);

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Game-Code Stock</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Add Roblox account ID and password stock.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="space-y-3 mb-8">
              {params?.created ? <div className="alert-success">Code added to stock.</div> : null}
              {params?.error ? <div className="alert-error">Please check the code form.</div> : null}
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              {/* ── Add code form ── */}
              <form action={createCodeAction} className="utility-card space-y-4 animate-fade-in-up">
                <div>
                  <h2 className="text-body-strong">Add Code</h2>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">Choose a product, then add one ID/password pair.</p>
                </div>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Product</span>
                  <select name="productId" required className="input-apple">
                    <option value="">Select product</option>
                    {productRows.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {product.gameMap} ({product.availableCodes} available)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Game ID</span>
                  <input name="gameAccountId" required spellCheck={false} className="input-apple" />
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Game Password</span>
                  <input name="gamePassword" required spellCheck={false} className="input-apple" />
                </label>
                <button type="submit" className="btn-pill w-full" disabled={productRows.length === 0}>Add Code</button>
                {productRows.length === 0 ? (
                  <p className="text-caption text-[var(--muted-foreground)]">Create a product before adding code stock.</p>
                ) : null}
              </form>

              {/* ── Stock summary + codes ── */}
              <div className="space-y-5">
                <div className="utility-card animate-fade-in-up delay-1">
                  <h2 className="text-body-strong">Product Stock Summary</h2>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">Use this to decide which products need more codes.</p>
                  {productRows.length === 0 ? (
                    <p className="text-caption mt-4 text-[var(--muted-foreground)]">Create a product before tracking stock.</p>
                  ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {productRows.map((product) => {
                        const stock = getStockBadge(product.availableCodes);
                        return (
                          <div key={product.id} className="rounded-xl border border-[var(--hairline)] px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="text-caption-strong truncate">{product.name}</h3>
                                <p className="text-fine-print mt-0.5 text-[var(--muted-foreground)]">{product.gameMap}</p>
                              </div>
                              <span className={stock.badgeClass}>{stock.label}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                              <div><p className="text-fine-print text-[var(--muted-foreground)]">Avail</p><p className="text-caption-strong tabular-nums mt-0.5">{product.availableCodes}</p></div>
                              <div><p className="text-fine-print text-[var(--muted-foreground)]">Sold</p><p className="text-caption-strong tabular-nums mt-0.5">{product.soldCodes}</p></div>
                              <div><p className="text-fine-print text-[var(--muted-foreground)]">Hold</p><p className="text-caption-strong tabular-nums mt-0.5">{product.reservedCodes}</p></div>
                              <div><p className="text-fine-print text-[var(--muted-foreground)]">Total</p><p className="text-caption-strong tabular-nums mt-0.5">{product.totalCodes}</p></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {codeRows.length === 0 ? (
                  <div className="utility-card text-caption text-[var(--muted-foreground)]">No codes in stock yet.</div>
                ) : (
                  codeRows.map((code) => (
                    <div key={code.id} className="utility-card">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-body-strong truncate">{code.productName}</h3>
                          <p className="text-caption text-[var(--muted-foreground)]">{code.gameMap}</p>
                        </div>
                        <span className={getStatusBadge(code.status)}>{code.status}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-2.5">
                          <p className="text-fine-print text-[var(--muted-foreground)]">Game ID</p>
                          <p className="text-caption-strong mt-0.5 break-all">{code.gameAccountId}</p>
                        </div>
                        <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-2.5">
                          <p className="text-fine-print text-[var(--muted-foreground)]">Added</p>
                          <p className="text-caption-strong mt-0.5" suppressHydrationWarning>{code.createdAt.toLocaleString("th-TH")}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
