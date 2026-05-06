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
              <div className="relative overflow-hidden border-b border-white/10 px-6 py-8 sm:px-8">
                <div className="absolute right-8 top-6 hidden size-28 rotate-[-10deg] rounded-3xl border border-white/10 bg-white/[0.04] sm:block" />
                <div className="absolute right-20 top-24 hidden size-3 rotate-45 bg-white/15 sm:block" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="grid size-16 shrink-0 place-items-center rounded-3xl border border-white/10 bg-white/[0.06] text-white">
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
                  <Link href="/products" className="btn-pill-ghost shrink-0 border-white/30 px-5 py-3 text-caption text-white hover:bg-white/10">
                    เลือกดูสินค้า
                  </Link>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div aria-live="polite">
                  {params?.success ? (
                    <div className="alert-success animate-fade-in">
                      ซื้อสำเร็จแล้ว กดปุ่มดูรหัสในรายการซื้อเพื่อเปิด ID และ Password
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
