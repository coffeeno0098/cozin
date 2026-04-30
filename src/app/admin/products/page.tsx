import { asc, count, eq, sql } from "drizzle-orm";
import Link from "next/link";

import { createProductAction, deleteMapAction, toggleProductAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
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
  if (availableCodes === 0) {
    return {
      label: "Out of stock",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "Low stock",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    label: "In stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create products and control product visibility.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {params?.created ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Product created.
          </div>
        ) : null}
        {params?.updated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Product updated.
          </div>
        ) : null}
        {params?.mapDeleted ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Map deleted.
          </div>
        ) : null}
        {params?.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {params.error === "map-in-use"
              ? "This map is still used by products."
              : params.error === "map"
                ? "Please select or create a map."
                : "Please check the product form."}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form action={createProductAction} className="space-y-4 rounded-lg border p-5">
            <div>
              <h2 className="font-semibold">Add product</h2>
              <p className="mt-1 text-sm text-muted-foreground">Example: Captain, Blox Fruit, 10 Point.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Product name</span>
              <input name="name" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Existing map</span>
              <select name="mapId" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Create or choose map</option>
                {mapRows.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">New map</span>
              <input
                name="newMapName"
                placeholder="Blox Fruit"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
              <span className="text-xs text-muted-foreground">
                Leave this empty when choosing an existing map. A new name here will create a map automatically.
              </span>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Price Point</span>
              <input
                name="pricePoints"
                type="number"
                min={1}
                required
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Description</span>
              <textarea name="description" className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked className="size-4" />
              Active
            </label>
            <Button type="submit" className="w-full">
              Add product
            </Button>
          </form>

          <div className="space-y-3">
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Maps</h2>
              <p className="mt-1 text-sm text-muted-foreground">Delete maps only when no product is using them.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {mapRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No maps yet.</p>
                ) : (
                  mapRows.map((map) => (
                    <div key={map.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <span>{map.name}</span>
                      <span className="text-muted-foreground">({map.productCount})</span>
                      <form action={deleteMapAction}>
                        <input type="hidden" name="mapId" value={map.id} />
                        <Button type="submit" size="xs" variant="ghost" disabled={map.productCount > 0}>
                          Delete
                        </Button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>

            {productRows.length === 0 ? (
              <div className="rounded-lg border p-5 text-sm text-muted-foreground">No products yet.</div>
            ) : (
              productRows.map((product) => {
                const stockBadge = getStockBadge(product.availableCodes);

                return (
                  <div key={product.id} className="rounded-lg border p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                          {product.isActive ? "Active" : "Hidden"}
                        </span>
                        <span className={`rounded-md border px-2 py-1 text-xs ${stockBadge.className}`}>
                          {stockBadge.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{product.gameMap}</p>
                      {product.description ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.description}</p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-right sm:min-w-64">
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-semibold">{product.pricePoints}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="font-semibold">{product.availableCodes}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">Sold</p>
                        <p className="font-semibold">{product.soldCodes}</p>
                      </div>
                      <div className="rounded-md border px-3 py-2">
                        <p className="text-xs text-muted-foreground">Reserved / Total</p>
                        <p className="font-semibold">
                          {product.reservedCodes} / {product.totalCodes}
                        </p>
                      </div>
                    </div>
                  </div>
                  <form action={toggleProductAction} className="mt-4">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="isActive" value={String(!product.isActive)} />
                    <Button type="submit" size="sm" variant="outline">
                      {product.isActive ? "Hide product" : "Show product"}
                    </Button>
                  </form>
                </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
