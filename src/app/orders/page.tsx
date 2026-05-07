import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { gameCodes, gameMaps, orders, payments, products } from "@/db/schema";

import { OrderHistoryList } from "./order-history-list";

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
  const [orderRows, topupRows] = await Promise.all([
    db
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
      .orderBy(desc(orders.createdAt)),
    db
      .select({
        id: payments.id,
        amountBaht: payments.amountBaht,
        pointsGranted: payments.pointsGranted,
        status: payments.status,
        externalReference: payments.externalReference,
        createdAt: payments.createdAt,
        verifiedAt: payments.verifiedAt,
      })
      .from(payments)
      .where(eq(payments.userId, session.user.id))
      .orderBy(desc(payments.createdAt)),
  ]);
  const orderItems = orderRows.map((order) => ({
    id: order.id,
    productName: order.productName,
    gameMap: order.gameMap,
    pricePoints: order.pricePoints,
    status: order.status,
    createdAt: order.createdAt.toLocaleString("th-TH"),
    gameAccountId: order.gameAccountId,
    gamePassword: order.gamePassword,
  }));
  const topupItems = topupRows.map((payment) => ({
    id: payment.id,
    amountBaht: payment.amountBaht,
    pointsGranted: payment.pointsGranted,
    status: payment.status,
    externalReference: payment.externalReference,
    createdAt: payment.createdAt.toLocaleString("th-TH"),
    verifiedAt: payment.verifiedAt?.toLocaleString("th-TH") ?? null,
  }));

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1 bg-black text-white">
        <section className="px-5 pb-14 pt-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090909] shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
              {/* ── Gradient accent bar ── */}
              <div
                className="h-1"
                style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa, #38bdf8)" }}
              />

              <div className="relative overflow-hidden border-b border-white/10 px-6 py-8 sm:px-8">
                {/* ── Decorative background elements ── */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 hidden size-64 rounded-full opacity-[0.04] blur-3xl sm:block"
                  style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
                />
                <div className="absolute right-8 top-6 hidden size-28 rotate-[-10deg] rounded-3xl border border-white/[0.06] bg-white/[0.02] sm:block" />
                <div
                  className="absolute right-20 top-24 hidden size-3 rotate-45 sm:block"
                  style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}
                />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className="grid size-16 shrink-0 place-items-center rounded-3xl text-white shadow-lg"
                      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 32px rgba(129,140,248,0.25)" }}
                    >
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M3 12a9 9 0 109-9m0 0v4m0-4H8m4 5v5l3 2"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-display-lg text-white">ประวัติการซื้อ</h1>
                      <p className="text-body mt-1 text-white/58">
                        ตรวจสอบรายการสั่งซื้อ และกดดูรหัสเกมเมื่อพร้อมใช้งาน
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-caption-strong text-white transition hover:border-white/40 hover:bg-white/[0.06]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    เลือกดูสินค้า
                  </Link>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div aria-live="polite">
                  {params?.success ? (
                    <div
                      className="animate-fade-in flex items-start gap-3 rounded-2xl border px-5 py-4 text-caption-strong"
                      style={{ background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.2)", color: "#6ee7b7" }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>ซื้อสำเร็จแล้ว กดปุ่มดูรหัสในรายการซื้อเพื่อเปิด ID และ Password</span>
                    </div>
                  ) : null}
                </div>

                <div className={params?.success ? "mt-5" : ""}>
                  <OrderHistoryList orders={orderItems} topups={topupItems} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
