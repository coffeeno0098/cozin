import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { requireAdmin } from "@/lib/admin";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

const statIcons: Record<string, string> = {
  Sales: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 0.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-0.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  Orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  Topups: "M12 6v12m6-6H6m15 0a9 9 0 11-18 0 9 9 0 0118 0z",
  Pending: "M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z",
  Products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  Stock: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Announcement: "M11 5L6 9H3v6h3l5 4V5zm8.07 2.93a10 10 0 010 8.14M15.54 11a4 4 0 010 2",
  Audit: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  Users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8m22 10v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75",
};

function formatDate(date: Date) {
  return date.toLocaleString("th-TH");
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStockBadgeClass(status: "out" | "low" | "healthy") {
  if (status === "out") return "badge-error";
  if (status === "low") return "badge-warning";
  return "badge-success";
}

function getPaymentBadgeClass(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "badge-success";
  if (status === "rejected") return "badge-error";
  return "badge-warning";
}

function getOrderBadgeClass(status: string) {
  if (status === "completed") return "badge-success";
  if (status === "failed" || status === "cancelled") return "badge-error";
  return "badge-neutral";
}

function DashboardIcon({ iconKey }: { iconKey: string }) {
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-2xl text-white"
      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 6px 20px rgba(129,140,248,0.25)" }}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={statIcons[iconKey] ?? statIcons.Products}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function EmptyDashboardCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative grid min-h-[160px] place-items-center overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-5 py-8 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ background: "radial-gradient(ellipse at center, #818cf8, transparent 70%)" }}
      />
      <div className="relative">
        <div
          className="mx-auto grid size-14 place-items-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 6px 20px rgba(129,140,248,0.2)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-body-strong mt-4 text-white">{title}</p>
        <p className="text-caption mt-2 text-white/55">{description}</p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const currentUser = await requireAdmin();
  const dashboard = await getAdminDashboardData();

  const stats = [
    {
      iconKey: "Sales",
      label: "ยอดขาย",
      value: `${dashboard.salesSummary.totalSalesPoints} Point`,
      detail: "รวม Point จากออเดอร์ทั้งหมด",
    },
    {
      iconKey: "Orders",
      label: "ออเดอร์",
      value: dashboard.salesSummary.orderCount,
      detail: "จำนวนการซื้อทั้งหมด",
    },
    {
      iconKey: "Topups",
      label: "เติมเงิน",
      value: `${dashboard.paymentSummary.verifiedTopupPoints} Point`,
      detail: `ยืนยันแล้ว ${dashboard.paymentSummary.verifiedTopupBaht} บาท`,
    },
    {
      iconKey: "Pending",
      label: "รอตรวจสอบ",
      value: dashboard.paymentSummary.pendingPaymentCount,
      detail: "รายการเติมเงินสถานะ pending",
    },
    {
      iconKey: "Products",
      label: "สินค้า",
      value: `${dashboard.productSummary.activeProductCount} / ${dashboard.productSummary.totalProductCount}`,
      detail: "เปิดขาย / ทั้งหมด",
    },
  ];

  const adminLinks = [
    { iconKey: "Products", label: "สินค้า", description: "จัดการสินค้าและหมวดหมู่", href: "/admin/products", primary: true },
    { iconKey: "Stock", label: "Stock รหัสเกม", description: "จัดการรหัสเกมและสต็อก", href: "/admin/codes", primary: true },
    { iconKey: "Orders", label: "ออเดอร์", description: "ดูรายการซื้อทั้งหมด", href: "/admin/orders", primary: false },
    { iconKey: "Topups", label: "การชำระเงิน", description: "ตรวจสอบรายการเติมเงิน", href: "/admin/payments", primary: false },
    { iconKey: "Users", label: "ผู้ใช้", description: "จัดการผู้ใช้และ Point", href: "/admin/users", primary: false },
    { iconKey: "Announcement", label: "ประกาศ", description: "จัดการแถบประกาศ", href: "/admin/announcements", primary: false },
    { iconKey: "Audit", label: "Audit Logs", description: "ตรวจสอบประวัติ admin", href: "/admin/audit-logs", primary: false },
  ];

  return (
    <>
      <SiteNav />

      <main id="main-content" className="relative flex-1 overflow-hidden bg-black text-white">
        <section className="relative px-5 pb-14 pt-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <div
                    className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-display-lg text-white">แดชบอร์ดร้าน</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="text-caption text-white/62">
                        ยินดีต้อนรับ, {currentUser.username}
                      </p>
                      <span
                        className="rounded-full px-3 py-1 text-fine-print font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)" }}
                      >
                        ผู้ดูแลระบบ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 animate-fade-in-up delay-1">
                <Link
                  href="/admin/codes"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-caption font-bold text-white transition hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 6px 20px rgba(129,140,248,0.3)" }}
                >
                  <span aria-hidden="true">+</span>
                  เพิ่ม Stock
                </Link>
                <Link
                  href="/admin/products"
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-caption font-bold text-white/90 transition hover:bg-white/[0.06] hover:text-white"
                  style={{ borderColor: "rgba(129,140,248,0.25)" }}
                >
                  จัดการสินค้า
                </Link>
              </div>
            </header>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {stats.map((stat, i) => (
                <article
                  key={stat.label}
                  className={`overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0b0b] shadow-[0_20px_60px_rgba(0,0,0,0.28)] animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}
                >
                  <div
                    className="h-1"
                    style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
                  />
                  <div className="p-5">
                    <DashboardIcon iconKey={stat.iconKey} />
                    <p className="text-caption-strong mt-5 text-white">{stat.label}</p>
                    <p className="mt-4 text-3xl font-semibold leading-none text-white tabular-nums">{stat.value}</p>
                    <p className="text-caption mt-3 min-h-[40px] text-white/55">{stat.detail}</p>
                  </div>
                </article>
              ))}

              <article className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0b0b0b] shadow-[0_20px_60px_rgba(0,0,0,0.28)] animate-fade-in-up delay-6">
                <div
                  className="h-1"
                  style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
                />
                <div className="p-5">
                  <DashboardIcon iconKey="Stock" />
                  <p className="text-caption-strong mt-5 text-white">Stock</p>
                  <p className="mt-4 text-3xl font-semibold leading-none text-white tabular-nums">
                    {dashboard.stockSummary.availableCodes}
                  </p>
                  <div className="mt-5 space-y-3 text-caption">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1.5 text-white/55">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#34c759" }} />
                        พร้อมขาย
                      </span>
                      <span className="font-semibold text-white tabular-nums">{dashboard.stockSummary.availableCodes}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                      <span className="flex items-center gap-1.5 text-white/55">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                        ขายแล้ว
                      </span>
                      <span className="font-semibold text-white tabular-nums">{dashboard.stockSummary.soldCodes}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-white/55">
                        <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                        จองไว้
                      </span>
                      <span className="font-semibold text-white tabular-nums">{dashboard.stockSummary.reservedCodes}</span>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1.25fr_0.95fr]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] animate-fade-in-up">
                  <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-body-strong text-white">Stock ใกล้หมด</h2>
                      <p className="text-caption mt-1 text-white/55">
                        สินค้าที่เปิดขายและเหลือรหัสไม่เกิน 5 ชิ้น
                      </p>
                    </div>
                    <Link href="/admin/codes" className="btn-pill-ghost border-white/30 px-4 py-2 text-caption text-white">
                      เพิ่มรหัส
                    </Link>
                  </div>

                  {dashboard.lowStockProducts.length === 0 ? (
                    <div className="mt-5">
                      <EmptyDashboardCard
                        title="Stock ยังเพียงพอ"
                        description="ยังไม่มีสินค้าที่ใกล้หมดในขณะนี้"
                      />
                    </div>
                  ) : (
                    <div className="mt-5 divide-y divide-white/10">
                      {dashboard.lowStockProducts.map((product) => (
                        <Link
                          key={product.id}
                          href="/admin/codes"
                          className="group flex items-center justify-between gap-4 py-3 transition-colors hover:bg-white/[0.03]"
                        >
                          <div className="min-w-0">
                            <p className="text-caption-strong truncate text-white">{product.name}</p>
                            <p className="text-fine-print mt-1 text-white/55">{product.gameMap}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className={getStockBadgeClass(product.stockStatus)}>
                              {product.stockStatus === "out" ? "หมด" : `เหลือ ${product.availableCodes} ชิ้น`}
                            </span>
                            <span className="text-white/45 transition-colors group-hover:text-white">›</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                   )}
                  </div>
                </section>

                {dashboard.lowStockProducts.length > 0 ? (
                  <EmptyDashboardCard
                    title="Stock อื่นยังเพียงพอ"
                    description="สินค้าที่ไม่อยู่ในรายการนี้ยังไม่เข้าเกณฑ์ใกล้หมด"
                  />
                ) : null}
              </div>

              <div className="space-y-5">
                <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] animate-fade-in-up delay-1">
                  <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-body-strong text-white">ออเดอร์ล่าสุด</h2>
                      <p className="text-caption mt-1 text-white/55">รายการซื้อที่เกิดขึ้นล่าสุด</p>
                    </div>
                    <Link href="/admin/orders" className="text-caption text-white/75 hover:text-white hover:underline underline-offset-4">
                      ดูทั้งหมด ›
                    </Link>
                  </div>

                  {dashboard.latestOrders.length === 0 ? (
                    <div className="mt-5">
                      <EmptyDashboardCard title="ยังไม่มีออเดอร์" description="เมื่อมีออเดอร์จะแสดงที่นี่" />
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-caption">
                        <thead className="text-white/45">
                          <tr className="border-b border-white/10">
                            <th className="pb-3 font-medium">สินค้า</th>
                            <th className="pb-3 font-medium">ผู้ใช้</th>
                            <th className="pb-3 font-medium">ราคา</th>
                            <th className="pb-3 font-medium">เวลา</th>
                            <th className="pb-3 text-right font-medium">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {dashboard.latestOrders.map((order) => (
                          <tr key={order.id} className="transition-colors hover:bg-white/[0.03]">
                              <td className="max-w-[190px] py-3">
                                <p className="truncate font-semibold text-white">{order.productName}</p>
                                <p className="text-fine-print mt-1 text-white/45">{order.gameMap}</p>
                              </td>
                              <td className="py-3 text-white/72">{order.username}</td>
                              <td className="py-3 font-semibold text-white tabular-nums">{order.pricePoints}</td>
                              <td className="py-3 text-white/60" suppressHydrationWarning>{formatTime(order.createdAt)}</td>
                              <td className="py-3 text-right">
                                <span className={getOrderBadgeClass(order.status)}>{order.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  </div>
                </section>

                <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] animate-fade-in-up delay-2">
                  <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                  <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-body-strong text-white">การชำระเงินล่าสุด</h2>
                      <p className="text-caption mt-1 text-white/55">รายการเติมเงิน TrueMoney ล่าสุด</p>
                    </div>
                    <Link href="/admin/payments" className="text-caption text-white/75 hover:text-white hover:underline underline-offset-4">
                      ดูทั้งหมด ›
                    </Link>
                  </div>

                  {dashboard.latestPayments.length === 0 ? (
                    <div className="mt-5">
                      <EmptyDashboardCard title="ยังไม่มีรายการชำระเงิน" description="เมื่อมีรายการชำระเงินจะแสดงที่นี่" />
                    </div>
                  ) : (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left text-caption">
                        <thead className="text-white/45">
                          <tr className="border-b border-white/10">
                            <th className="pb-3 font-medium">ผู้ใช้</th>
                            <th className="pb-3 font-medium">สถานะ</th>
                            <th className="pb-3 font-medium">เวลา</th>
                            <th className="pb-3 text-right font-medium">Point</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {dashboard.latestPayments.map((payment) => (
                            <tr key={payment.id} className="transition-colors hover:bg-white/[0.03]">
                              <td className="py-3 font-semibold text-white">{payment.username}</td>
                              <td className="py-3">
                                <span className={getPaymentBadgeClass(payment.status)}>{payment.status}</span>
                              </td>
                              <td className="py-3 text-white/60" suppressHydrationWarning>{formatDate(payment.createdAt)}</td>
                              <td className="py-3 text-right font-semibold text-white tabular-nums">
                                {payment.pointsGranted} Point
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  </div>
                </section>
              </div>

              <aside className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] animate-fade-in-up delay-3">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                <div className="p-5">
                  <h2 className="text-body-strong text-white">เมนูลัด Admin</h2>
                <p className="text-caption mt-1 text-white/55">
                  เมนูที่ใช้บ่อยสำหรับดูแลร้าน
                </p>

                <div className="mt-5 space-y-3">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center gap-4 rounded-[1rem] border border-white/[0.08] bg-white/[0.02] p-4 transition-[background-color,border-color,box-shadow] hover:border-[rgba(129,140,248,0.2)] hover:bg-white/[0.05] hover:shadow-[0_8px_24px_rgba(129,140,248,0.08)]"
                    >
                      <DashboardIcon iconKey={link.iconKey} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-caption-strong text-white">{link.label}</span>
                        <span className="mt-1 block truncate text-fine-print text-white/50">{link.description}</span>
                        <span className="mt-2 block truncate text-fine-print text-white/35">{link.href}</span>
                      </span>
                      <span className={`${link.primary ? "text-white" : "text-white/45"} transition-colors group-hover:text-white`}>
                        ›
                      </span>
                    </Link>
                  ))}
                </div>
                </div>
              </aside>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
