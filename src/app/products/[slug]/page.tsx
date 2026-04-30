import { eq, sql } from "drizzle-orm";
import { ArrowLeft, Box, Coins, History, LockKeyhole, ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buyProductAction } from "@/app/products/actions";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { gameCodes, gameMaps, products, users } from "@/db/schema";

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
  "rate-limit": "Too many purchase attempts. Please wait a moment and try again.",
};

function getStockStatus(availableCodes: number) {
  if (availableCodes === 0) {
    return {
      label: "Out of stock",
      description: "This product is temporarily unavailable.",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "Low stock",
      description: "Only a small amount is available.",
      className: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    label: "In stock",
    description: "Ready for automatic delivery.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
}

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
      isActive: products.isActive,
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

  if (!product.isActive) {
    notFound();
  }

  const [currentUser] = session?.user?.id
    ? await db
        .select({
          points: users.points,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
    : [];

  const isInStock = product.availableCodes > 0;
  const isLoggedIn = Boolean(session?.user?.id);
  const userPoints = currentUser?.points ?? 0;
  const hasEnoughPoints = isLoggedIn && userPoints >= product.pricePoints;
  const canBuy = isLoggedIn && isInStock && hasEnoughPoints;
  const stockStatus = getStockStatus(product.availableCodes);
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">{product.gameMap}</p>
                <span className={`rounded-md border px-2 py-1 text-xs ${stockStatus.className}`}>
                  {stockStatus.label}
                </span>
              </div>
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Box className="size-4" />
                Stock status
              </div>
              <p className="mt-2 text-xl font-semibold">{stockStatus.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stockStatus.description}</p>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4" />
                Delivery
              </div>
              <p className="mt-2 text-xl font-semibold">Automatic</p>
              <p className="mt-1 text-xs text-muted-foreground">ID and password appear in purchase history after buying.</p>
            </div>
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <History className="size-4" />
                History
              </div>
              <p className="mt-2 text-xl font-semibold">Saved</p>
              <p className="mt-1 text-xs text-muted-foreground">Purchased codes stay available in your account.</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-semibold">Purchase summary</h2>
                <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <dt>Product</dt>
                    <dd className="font-medium text-foreground">{product.name}</dd>
                  </div>
                  <div>
                    <dt>Map</dt>
                    <dd className="font-medium text-foreground">{product.gameMap}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd className="font-medium text-foreground">{product.pricePoints} Point</dd>
                  </div>
                  <div>
                    <dt>Your balance</dt>
                    <dd className="font-medium text-foreground">{isLoggedIn ? `${userPoints} Point` : "Login required"}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                {isLoggedIn ? (
                  <Button variant="outline" asChild>
                    <Link href="/orders">
                      <History className="size-4" />
                      Purchase history
                    </Link>
                  </Button>
                ) : null}
                {isLoggedIn && !hasEnoughPoints ? (
                  <Button variant="outline" asChild>
                    <Link href="/topup">
                      <Coins className="size-4" />
                      Top up
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
            {session?.user?.id ? (
              <form action={buyProductAction} className="space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                {errorMessage ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errorMessage}
                  </div>
                ) : null}
                {!hasEnoughPoints && isInStock ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    You need {product.pricePoints - userPoints} more Point to buy this product.
                  </div>
                ) : null}
                <Button type="submit" disabled={!canBuy}>
                  <ShoppingCart className="size-4" />
                  {!isInStock ? "Out of stock" : hasEnoughPoints ? "Buy now" : "Not enough Point"}
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
        </div>
      </section>
    </main>
  );
}
