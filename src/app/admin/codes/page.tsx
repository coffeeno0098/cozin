import { asc, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";

import { createCodeAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
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

export default async function CodesPage({ searchParams }: CodesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      isActive: products.isActive,
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Game-code stock</h1>
            <p className="mt-1 text-sm text-muted-foreground">Add Roblox account ID and password stock.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {params?.created ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Code added to stock.
          </div>
        ) : null}
        {params?.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Please check the code form.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form action={createCodeAction} className="space-y-4 rounded-lg border p-5">
            <div>
              <h2 className="font-semibold">Add code</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose a product, then add one ID/password pair.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Product</span>
              <select name="productId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Select product</option>
                {productRows.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.gameMap}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Game ID</span>
              <input name="gameAccountId" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Game password</span>
              <input name="gamePassword" required className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
            </label>
            <Button type="submit" className="w-full" disabled={productRows.length === 0}>
              Add code
            </Button>
            {productRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a product before adding code stock.</p>
            ) : null}
          </form>

          <div className="space-y-3">
            {codeRows.length === 0 ? (
              <div className="rounded-lg border p-5 text-sm text-muted-foreground">No codes in stock yet.</div>
            ) : (
              codeRows.map((code) => (
                <div key={code.id} className="rounded-lg border p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{code.productName}</h3>
                      <p className="text-sm text-muted-foreground">{code.gameMap}</p>
                    </div>
                    <span className="w-fit rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                      {code.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Game ID</p>
                      <p className="mt-1 break-all text-sm font-medium">{code.gameAccountId}</p>
                    </div>
                    <div className="rounded-md border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Added</p>
                      <p className="mt-1 text-sm font-medium">{code.createdAt.toLocaleString("th-TH")}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
