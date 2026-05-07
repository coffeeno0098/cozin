import { eq, sql } from "drizzle-orm";
import { AlertCircle, ClipboardList, Coins, Gamepad2, PackageCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { gameCodes, gameMaps, products, users } from "@/db/schema";
import { QuantityPurchaseForm } from "./quantity-purchase-form";

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
  const stockStatus = getStockStatus(product.availableCodes);
  const errorMessage = query?.error ? errorMessages[query.error] : null;
  const pointsNeeded = Math.max(product.pricePoints - userPoints, 0);
  const showPointWarning = isLoggedIn && isInStock && !hasEnoughPoints;
  const topAlertTitle = errorMessage
    ? "เกิดข้อผิดพลาด"
    : !isInStock
      ? "สินค้าหมด"
      : showPointWarning
        ? "Point ไม่พอ"
        : null;
  const topAlertDescription = errorMessage
    ? errorMessage
    : !isInStock
      ? "สินค้านี้หมดชั่วคราว กรุณากลับมาดูอีกครั้งภายหลัง"
      : showPointWarning
        ? `คุณต้องเติมเพิ่มอีก ${pointsNeeded} Point จึงจะซื้อสินค้านี้ได้`
        : null;

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1 bg-black text-white">
        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {topAlertTitle && topAlertDescription ? (
              <div className="animate-fade-in-up rounded-xl border border-red-500/35 bg-red-500/10 px-5 py-4 text-red-100">
                <div className="flex gap-4">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-300" aria-hidden="true" />
                  <div>
                    <p className="text-caption-strong">{topAlertTitle}</p>
                    <p className="text-caption mt-1 text-red-100/70">{topAlertDescription}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[minmax(280px,450px)_1fr_390px] lg:items-start">
              {/* ── Left: Image & Description ── */}
              <section className="animate-fade-in-up space-y-8">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_22px_70px_rgba(0,0,0,0.42)]">
                  {/* Gradient accent on image card */}
                  <div
                    className="h-1"
                    style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
                  />
                  <div className="aspect-square">
                    {product.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="relative grid h-full place-items-center bg-gradient-to-br from-[#151515] to-black text-white/65">
                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.04]"
                          style={{ background: "radial-gradient(ellipse at center, #818cf8, transparent 70%)" }}
                        />
                        <PackageCheck size={72} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-white">
                    <div
                      className="grid size-7 place-items-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)" }}
                    >
                      <ClipboardList size={14} color="white" aria-hidden="true" />
                    </div>
                    <h2 className="text-body-strong">รายละเอียดสินค้า</h2>
                  </div>
                  <p className="text-caption mt-5 leading-7 text-white/58">
                    {product.description || `${product.name} สำหรับ Map ${product.gameMap} พร้อมรับรหัสทันทีหลังซื้อสำเร็จ`}
                  </p>
                </div>
              </section>

              {/* ── Middle: Product Info ── */}
              <section className="animate-fade-in-up delay-1 pt-4 lg:pt-6">
                <div
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-caption-strong text-white"
                  style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(96,165,250,0.12) 100%)", border: "1px solid rgba(129,140,248,0.2)" }}
                >
                  <Gamepad2 size={16} aria-hidden="true" style={{ color: "#a78bfa" }} />
                  {product.gameMap}
                </div>

                <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-[-0.02em] text-white">
                  {product.name}
                </h1>

                <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-caption-strong text-white">
                  <span className={`size-3 rounded-full ${product.availableCodes === 0 ? "bg-red-500" : product.availableCodes <= 2 ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />
                  {stockStatus.label}
                </div>
                <p className="text-caption mt-3 text-white/55">
                  เหลือเพียง {product.availableCodes} ชิ้น
                </p>

                <div className="my-8 h-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 6px 20px rgba(129,140,248,0.25)" }}
                  >
                    <Coins size={22} aria-hidden="true" />
                  </span>
                  <p className="text-4xl font-semibold tabular-nums text-white">
                    {product.pricePoints} <span className="text-2xl text-white/65">Point</span>
                  </p>
                </div>
              </section>

              {/* ── Right: Purchase Summary Sidebar ── */}
              <aside className="animate-fade-in-up delay-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
                {/* Gradient accent bar */}
                <div
                  className="h-1"
                  style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
                />

                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-8 place-items-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%)", border: "1px solid rgba(129,140,248,0.2)" }}
                    >
                      <ClipboardList size={16} aria-hidden="true" style={{ color: "#a78bfa" }} />
                    </div>
                    <h2 className="text-body-strong">สรุปการซื้อ</h2>
                  </div>

                  <dl className="mt-8 space-y-5 text-caption">
                    <div className="flex items-center justify-between gap-5">
                      <dt className="flex items-center gap-2 font-semibold text-white">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                        สินค้า
                      </dt>
                      <dd className="text-right font-medium text-white/72">{product.name}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-5">
                      <dt className="flex items-center gap-2 font-semibold text-white">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#818cf8" }} />
                        Map
                      </dt>
                      <dd className="text-right font-medium text-white/72">{product.gameMap}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-5">
                      <dt className="flex items-center gap-2 font-semibold text-white">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                        ราคา
                      </dt>
                      <dd className="inline-flex items-center gap-2 text-right font-semibold text-white">
                        <span
                          className="grid size-6 place-items-center rounded-full text-white"
                          style={{ background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)" }}
                        >
                          <Coins size={15} aria-hidden="true" />
                        </span>
                        {product.pricePoints} Point
                      </dd>
                    </div>
                  </dl>

                  <div className="my-7 h-px bg-white/10" />

                  <div>
                    <p className="text-caption-strong">Point ของคุณ</p>
                    <p className={`mt-3 inline-flex items-center gap-2 text-3xl font-semibold tabular-nums ${hasEnoughPoints ? "text-white" : "text-red-300"}`}>
                      <span
                        className="grid size-8 place-items-center rounded-full text-white"
                        style={{ background: hasEnoughPoints ? "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)" : "rgba(255,255,255,0.06)", border: hasEnoughPoints ? "none" : "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <Coins size={18} aria-hidden="true" />
                      </span>
                      {isLoggedIn ? `${userPoints} Point` : "ยังไม่ได้เข้าสู่ระบบ"}
                    </p>
                  </div>

                  <div className="mt-7" aria-live="polite">
                    {errorMessage ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-4 text-red-100">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div>
                          <p className="text-caption-strong">ไม่สามารถซื้อได้</p>
                          <p className="text-caption mt-1 text-red-100/70">{errorMessage}</p>
                        </div>
                      </div>
                    ) : null}
                    {showPointWarning ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-4 text-red-100">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <div>
                          <p className="text-caption-strong">Point ไม่พอ</p>
                          <p className="text-caption mt-1 text-red-100/70">
                            คุณต้องเติมเพิ่มอีก {pointsNeeded} Point จึงจะสามารถซื้อสินค้านี้ได้
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-7">
                    {session?.user?.id ? (
                      <QuantityPurchaseForm
                        productId={product.id}
                        slug={product.slug}
                        pricePoints={product.pricePoints}
                        userPoints={userPoints}
                        availableCodes={product.availableCodes}
                      />
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-caption-strong text-white transition"
                        style={{
                          background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
                          boxShadow: "0 8px 28px rgba(129,140,248,0.3)",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        เข้าสู่ระบบเพื่อซื้อ
                      </Link>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
