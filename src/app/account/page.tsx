import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user] = await db
    .select({
      username: users.username,
      email: users.email,
      points: users.points,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      {/* ── Nav ── */}
      <SiteNav />

      <main id="main-content" className="flex-1">
        {/* ── Header (parchment) ── */}
        <section className="tile-parchment tile-section relative overflow-hidden py-12">
          <div className="relative mx-auto max-w-4xl animate-fade-in-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h1 className="text-hero-display">{user.username}</h1>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-caption font-semibold transition hover:bg-[rgba(129,140,248,0.06)]"
                  style={{ borderColor: "rgba(129,140,248,0.2)", color: "#818cf8" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Stats + Actions ── */}
        <section className="tile-light tile-section relative overflow-hidden">
          <div className="relative mx-auto max-w-4xl">
            {/* ── Stats cards ── */}
            <div className="grid gap-5 sm:grid-cols-3 animate-fade-in-up delay-1">
              <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                <div className="px-5 py-6 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-fine-print text-[var(--muted-foreground)]">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                    Point
                  </p>
                  <p className="text-hero-display tabular-nums mt-3">{user.points}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #818cf8, #60a5fa, #38bdf8)" }} />
                <div className="px-5 py-6 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-fine-print text-[var(--muted-foreground)]">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                    Email
                  </p>
                  <p className="text-body-strong mt-3 break-all">{user.email ?? "ยังไม่ได้ตั้งค่า"}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #60a5fa, #38bdf8, #2dd4bf)" }} />
                <div className="px-5 py-6 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-fine-print text-[var(--muted-foreground)]">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: "#38bdf8" }} />
                    สิทธิ์
                  </p>
                  <p className="text-body-strong mt-3 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 animate-fade-in-up delay-2">
              <Link href="/topup" className="group block overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(129,140,248,0.08)]">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)", boxShadow: "0 4px 14px rgba(167,139,250,0.25)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h2 className="text-body-strong">เติม Point</h2>
                  </div>
                  <p className="text-caption mt-3 text-[var(--muted-foreground)]">
                    ส่งลิงก์ซอง <span translate="no">TrueMoney</span> เพื่อเพิ่ม Point
                  </p>
                  <span
                    className="text-caption mt-4 inline-flex items-center gap-1.5 font-medium transition-colors"
                    style={{ color: "#818cf8" }}
                  >
                    ไปหน้าเติม Point
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
              <Link href="/orders" className="group block overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(129,140,248,0.08)]">
                <div className="h-1" style={{ background: "linear-gradient(90deg, #818cf8, #60a5fa, #38bdf8)" }} />
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)", boxShadow: "0 4px 14px rgba(129,140,248,0.25)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h2 className="text-body-strong">ประวัติการซื้อ</h2>
                  </div>
                  <p className="text-caption mt-3 text-[var(--muted-foreground)]">
                    ดูรหัสที่ซื้อแล้วและรายละเอียดการส่ง
                  </p>
                  <span
                    className="text-caption mt-4 inline-flex items-center gap-1.5 font-medium transition-colors"
                    style={{ color: "#818cf8" }}
                  >
                    ดูประวัติ
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Admin shortcuts ── */}
            {user.role === "admin" ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 animate-fade-in-up delay-3">
                <Link href="/admin/products" className="group block overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(129,140,248,0.08)]">
                  <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8)" }} />
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h2 className="text-body-strong">Manage Products</h2>
                    </div>
                    <p className="text-caption mt-3 text-[var(--muted-foreground)]">
                      Add products, set prices, and control visibility.
                    </p>
                    <span className="text-caption mt-4 inline-flex items-center gap-1 font-medium" style={{ color: "#818cf8" }}>
                      Products →
                    </span>
                  </div>
                </Link>
                <Link href="/admin/codes" className="group block overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(129,140,248,0.08)]">
                  <div className="h-1" style={{ background: "linear-gradient(90deg, #818cf8, #60a5fa)" }} />
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h2 className="text-body-strong">Manage Game Codes</h2>
                    </div>
                    <p className="text-caption mt-3 text-[var(--muted-foreground)]">
                      Add ID and password stock for products.
                    </p>
                    <span className="text-caption mt-4 inline-flex items-center gap-1 font-medium" style={{ color: "#818cf8" }}>
                      Codes →
                    </span>
                  </div>
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
