import { eq, sql } from "drizzle-orm";
import { ArrowLeft, Box, Coins, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buyProductAction } from "@/app/products/actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  "out-of-stock": "This product is out of stock.",
  "not-enough-points": "You do not have enough Point for this product.",
  "not-found": "This product is unavailable.",
};

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await auth();
  const [product] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      description: products.description,
      pricePoints: products.pricePoints,
      availableCodes: sql<number>`count(${gameCodes.id})::int`,
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, sql`${gameCodes.productId} = ${products.id} and ${gameCodes.status} = 'available'`)
    .where(eq(products.slug, slug))
    .groupBy(products.id, gameMaps.id)
    .limit(1);

  if (!product) {
    notFound();
  }

  const isInStock = product.availableCodes > 0;
  const errorMessage = query?.error ? errorMessages[query.error] : null;

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl space-y-8">
        <Button variant="ghost" asChild>
          <Link href="/products">
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{product.gameMap}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">{product.name}</h1>
              {product.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{product.description}</p>
              ) : null}
            </div>
            <div className="rounded-md bg-secondary px-4 py-3 text-right">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-xl font-semibold">{product.pricePoints} Point</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Box className="size-4" />
                Available stock
              </div>
              <p className="mt-2 text-3xl font-semibold">{product.availableCodes}</p>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="size-4" />
                Point rate
              </div>
              <p className="mt-2 text-3xl font-semibold">1 THB = 1 Point</p>
            </div>
          </div>

          <div className="mt-6">
            {session?.user?.id ? (
              <form action={buyProductAction} className="space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                {errorMessage ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}
                <Button type="submit" disabled={!isInStock}>
                  {isInStock ? "Buy with Point" : "Out of stock"}
                </Button>
              </form>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LockKeyhole className="size-4" />
                  Login to buy
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
