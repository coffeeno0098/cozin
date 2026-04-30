import { asc, count, eq, sql } from "drizzle-orm";
import Link from "next/link";

import { createProductAction, deleteMapAction, toggleProductAction } from "@/app/admin/actions";
import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type ProductsPageProps = {
  searchParams?: Promise<{
    created?: string;
    updated?: string;
    mapDeleted?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getStockBadge(availableCodes: number) {
  if (availableCodes === 0) return { label: "Out of stock", badgeClass: "badge-error" };
  if (availableCodes <= 2) return { label: "Low stock", badgeClass: "badge-warning" };
  return { label: "In stock", badgeClass: "badge-success" };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const productRows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      description: products.description,
      pricePoints: products.pricePoints,
      isActive: products.isActive,
      availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      soldCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reservedCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
      totalCodes: count(gameCodes.id),
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.createdAt));

  const mapRows = await db
    .select({
      id: gameMaps.id,
      name: gameMaps.name,
      productCount: count(products.id),
    })
    .from(gameMaps)
    .leftJoin(products, eq(products.mapId, gameMaps.id))
    .groupBy(gameMaps.id)
    .orderBy(asc(gameMaps.name));

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
            <h1 className="text-display-lg mt-1">Products</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Create products and control product visibility.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="space-y-3 mb-8">
              {params?.created ? <div className="alert-success">Product created.</div> : null}
              {params?.updated ? <div className="alert-success">Product updated.</div> : null}
              {params?.mapDeleted ? <div className="alert-success">Map deleted.</div> : null}
              {params?.error ? (
                <div className="alert-error">
                  {params.error === "map-in-use" ? "This map is still used by products."
                    : params.error === "map" ? "Please select or create a map."
                    : "Please check the product form."}
                </div>
              ) : null}
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              {/* ── Add product form ── */}
              <form action={createProductAction} className="utility-card space-y-4 animate-fade-in-up">
                <div>
                  <h2 className="text-body-strong">Add Product</h2>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">Example: Captain, Blox Fruit, 10 Point.</p>
                </div>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Product Name</span>
                  <input name="name" required spellCheck={false} className="input-apple" />
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Existing Map</span>
                  <select name="mapId" className="input-apple">
                    <option value="">Create or choose map</option>
                    {mapRows.map((map) => (
                      <option key={map.id} value={map.id}>{map.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">New Map</span>
                  <input name="newMapName" placeholder="Blox Fruit" spellCheck={false} className="input-apple" />
                  <span className="text-fine-print text-[var(--muted-foreground)]">
                    Leave empty when choosing an existing map. A new name here creates a map automatically.
                  </span>
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Price Point</span>
                  <input name="pricePoints" type="number" min={1} required className="input-apple" />
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Description</span>
                  <textarea name="description" className="textarea-apple" />
                </label>
                <label className="flex items-center gap-2 text-caption">
                  <input name="isActive" type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
                  Active
                </label>
                <button type="submit" className="btn-pill w-full">Add Product</button>
              </form>

              {/* ── Maps + Product list ── */}
              <div className="space-y-5">
                <div className="utility-card animate-fade-in-up delay-1">
                  <h2 className="text-body-strong">Maps</h2>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">Delete maps only when no product is using them.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mapRows.length === 0 ? (
                      <p className="text-caption text-[var(--muted-foreground)]">No maps yet.</p>
                    ) : (
                      mapRows.map((map) => (
                        <div key={map.id} className="flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface-parchment)] px-3 py-1.5 text-caption">
                          <span translate="no">{map.name}</span>
                          <span className="text-[var(--muted-foreground)] tabular-nums">({map.productCount})</span>
                          <form action={deleteMapAction}>
                            <input type="hidden" name="mapId" value={map.id} />
                            <button type="submit" disabled={map.productCount > 0} className="text-fine-print text-[var(--primary)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed hover:underline">
                              Delete
                            </button>
                          </form>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {productRows.length === 0 ? (
                  <div className="utility-card text-caption text-[var(--muted-foreground)]">No products yet.</div>
                ) : (
                  productRows.map((product, i) => {
                    const stockBadge = getStockBadge(product.availableCodes);
                    return (
                      <div key={product.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 2}` : ""}`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-body-strong truncate">{product.name}</h3>
                              <span className={product.isActive ? "badge-success" : "badge-neutral"}>
                                {product.isActive ? "Active" : "Hidden"}
                              </span>
                              <span className={stockBadge.badgeClass}>{stockBadge.label}</span>
                            </div>
                            <p className="text-caption mt-1 text-[var(--muted-foreground)]">{product.gameMap}</p>
                            {product.description ? (
                              <p className="text-caption mt-2 text-[var(--muted-foreground)] line-clamp-2">{product.description}</p>
                            ) : null}
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:min-w-56">
                            <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                              <p className="text-fine-print text-[var(--muted-foreground)]">Price</p>
                              <p className="text-body-strong tabular-nums">{product.pricePoints}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                              <p className="text-fine-print text-[var(--muted-foreground)]">Available</p>
                              <p className="text-body-strong tabular-nums">{product.availableCodes}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                              <p className="text-fine-print text-[var(--muted-foreground)]">Sold</p>
                              <p className="text-body-strong tabular-nums">{product.soldCodes}</p>
                            </div>
                            <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                              <p className="text-fine-print text-[var(--muted-foreground)]">Rsv / Total</p>
                              <p className="text-body-strong tabular-nums">{product.reservedCodes} / {product.totalCodes}</p>
                            </div>
                          </div>
                        </div>
                        <form action={toggleProductAction} className="mt-4">
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="isActive" value={String(!product.isActive)} />
                          <button type="submit" className="btn-pill-ghost text-caption px-4 py-2">
                            {product.isActive ? "Hide Product" : "Show Product"}
                          </button>
                        </form>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
