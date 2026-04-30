import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buyProductAction } from "@/app/products/actions";
import { auth } from "@/auth";
import { AnnouncementBar } from "@/components/announcement-bar";
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
      label: "Out of Stock",
      description: "This product is temporarily unavailable.",
      badgeClass: "badge-error",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "Low Stock",
      description: "Only a small amount is available.",
      badgeClass: "badge-warning",
    };
  }

  return {
    label: "In Stock",
    description: "Ready for automatic delivery.",
    badgeClass: "badge-success",
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
    <>
      {/* ── Sub-nav ── */}
      <div className="global-nav">
        <Link href="/" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">
          Cozin
        </Link>
        <Link
          href="/products"
          className="text-nav-link opacity-85 hover:opacity-100"
        >
          ← Back to Products
        </Link>
      </div>
      <AnnouncementBar />

      <main id="main-content" className="flex-1">
        {/* ── Hero (parchment) ── */}
        <section className="tile-parchment tile-section">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-caption text-[var(--muted-foreground)]">
                    {product.gameMap}
                  </p>
                  <span className={stockStatus.badgeClass}>
                    {stockStatus.label}
                  </span>
                </div>
                <h1 className="text-hero-display mt-3">{product.name}</h1>
                {product.description ? (
                  <p className="text-body mt-4 max-w-2xl text-[var(--muted-foreground)]">
                    {product.description}
                  </p>
                ) : null}
              </div>
              <div className="utility-card shrink-0 text-center sm:text-right">
                <p className="text-fine-print text-[var(--muted-foreground)]">
                  Price
                </p>
                <p className="text-display-lg tabular-nums mt-1">
                  {product.pricePoints}{" "}
                  <span className="text-lead font-normal">Point</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Info cards (white) ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-5 sm:grid-cols-3 animate-fade-in-up delay-1">
              <div className="utility-card">
                <p className="text-fine-print text-[var(--muted-foreground)]">
                  Stock Status
                </p>
                <p className="text-tagline mt-2">{stockStatus.label}</p>
                <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                  {stockStatus.description}
                </p>
              </div>
              <div className="utility-card">
                <p className="text-fine-print text-[var(--muted-foreground)]">
                  Delivery
                </p>
                <p className="text-tagline mt-2">Automatic</p>
                <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                  ID and password appear in purchase history after buying.
                </p>
              </div>
              <div className="utility-card">
                <p className="text-fine-print text-[var(--muted-foreground)]">
                  History
                </p>
                <p className="text-tagline mt-2">Saved</p>
                <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                  Purchased codes stay available in your account.
                </p>
              </div>
            </div>

            {/* ── Purchase summary ── */}
            <div className="utility-card mt-8 animate-fade-in-up delay-2">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-body-strong">Purchase Summary</h2>
                  <dl className="mt-4 grid gap-3 text-caption sm:grid-cols-2">
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Product</dt>
                      <dd className="font-medium mt-0.5">{product.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Map</dt>
                      <dd className="font-medium mt-0.5">{product.gameMap}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">Price</dt>
                      <dd className="font-medium tabular-nums mt-0.5">
                        {product.pricePoints} Point
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted-foreground)]">
                        Your Balance
                      </dt>
                      <dd className="font-medium tabular-nums mt-0.5">
                        {isLoggedIn ? `${userPoints} Point` : "Login required"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  {isLoggedIn ? (
                    <Link href="/orders" className="btn-pill-ghost text-caption px-4 py-2">
                      Purchase History
                    </Link>
                  ) : null}
                  {isLoggedIn && !hasEnoughPoints ? (
                    <Link href="/topup" className="btn-pill-ghost text-caption px-4 py-2">
                      Top Up
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-6" aria-live="polite">
                {session?.user?.id ? (
                  <form action={buyProductAction} className="space-y-3">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="slug" value={product.slug} />
                    {errorMessage ? (
                      <div className="alert-error">{errorMessage}</div>
                    ) : null}
                    {!hasEnoughPoints && isInStock ? (
                      <div className="alert-warning">
                        You need {product.pricePoints - userPoints} more Point
                        to buy this product.
                      </div>
                    ) : null}
                    <button type="submit" disabled={!canBuy} className="btn-pill disabled:opacity-50 disabled:cursor-not-allowed">
                      {!isInStock
                        ? "Out of Stock"
                        : hasEnoughPoints
                          ? "Buy Now"
                          : "Not Enough Point"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="btn-pill inline-flex">
                    Login to Buy
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
