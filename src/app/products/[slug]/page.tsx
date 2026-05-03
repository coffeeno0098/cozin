import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buyProductAction } from "@/app/products/actions";
import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
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
  "out-of-stock": "สินค้านี้หมดชั่วคราว",
  "not-enough-points": "Point ของคุณไม่พอสำหรับสินค้านี้",
  "not-found": "ไม่พบสินค้านี้หรือสินค้าไม่พร้อมใช้งาน",
  "rate-limit": "มีการกดซื้อถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
};

function getStockStatus(availableCodes: number) {
  if (availableCodes === 0) {
    return {
      label: "สินค้าหมด",
      badgeClass: "badge-error",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "เหลือน้อย",
      badgeClass: "badge-warning",
    };
  }

  return {
    label: "มีสินค้า",
    badgeClass: "badge-success",
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
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
      imageUrl: products.imageUrl,
      pricePoints: products.pricePoints,
      isActive: products.isActive,
      availableCodes: sql<number>`count(${gameCodes.id})::int`,
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(
      gameCodes,
      sql`${gameCodes.productId} = ${products.id} and ${gameCodes.status} = 'available'`,
    )
    .where(eq(products.slug, slug))
    .groupBy(products.id, gameMaps.id)
    .limit(1);

  if (!product || !product.isActive) {
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
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                {product.imageUrl ? (
                  <div className="mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : null}
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
                  ราคา
                </p>
                <p className="text-display-lg tabular-nums mt-1">
                  {product.pricePoints}{" "}
                  <span className="text-lead font-normal">Point</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl">
            <div className="utility-card animate-fade-in-up delay-1">
              <div>
                <h2 className="text-body-strong">สรุปการซื้อ</h2>
                <dl className="mt-4 grid gap-3 text-caption sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted-foreground)]">สินค้า</dt>
                    <dd className="font-medium mt-0.5">{product.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">Map</dt>
                    <dd className="font-medium mt-0.5">{product.gameMap}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">ราคา</dt>
                    <dd className="font-medium tabular-nums mt-0.5">
                      {product.pricePoints} Point
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)]">
                      Point ของคุณ
                    </dt>
                    <dd className="font-medium tabular-nums mt-0.5">
                      {isLoggedIn ? `${userPoints} Point` : "ต้องเข้าสู่ระบบก่อน"}
                    </dd>
                  </div>
                </dl>
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
                        ต้องเติมเพิ่มอีก {product.pricePoints - userPoints} Point
                        เพื่อซื้อสินค้านี้
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      disabled={!canBuy}
                      className="btn-pill disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!isInStock
                        ? "สินค้าหมด"
                        : hasEnoughPoints
                          ? "ซื้อเลย"
                          : "Point ไม่พอ"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="btn-pill inline-flex">
                    เข้าสู่ระบบเพื่อซื้อ
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
