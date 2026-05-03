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
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-hero-display">{user.username}</h1>
              <form action={logoutAction}>
                <button type="submit" className="btn-pill-ghost text-caption px-4 py-2">
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Stats (white) ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-5 sm:grid-cols-3 animate-fade-in-up delay-1">
              <div className="utility-card text-center">
                <p className="text-fine-print text-[var(--muted-foreground)]">Point</p>
                <p className="text-hero-display tabular-nums mt-3">{user.points}</p>
              </div>
              <div className="utility-card text-center">
                <p className="text-fine-print text-[var(--muted-foreground)]">Email</p>
                <p className="text-body-strong mt-3 break-all">{user.email ?? "ยังไม่ได้ตั้งค่า"}</p>
              </div>
              <div className="utility-card text-center">
                <p className="text-fine-print text-[var(--muted-foreground)]">สิทธิ์</p>
                <p className="text-body-strong mt-3 capitalize">{user.role}</p>
              </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 animate-fade-in-up delay-2">
              <Link href="/topup" className="utility-card group block">
                <h2 className="text-body-strong">เติม Point</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  ส่งลิงก์ซอง <span translate="no">TrueMoney</span> เพื่อเพิ่ม Point
                </p>
                <span className="text-caption mt-4 inline-flex items-center gap-1 text-[var(--primary)] transition-colors group-hover:text-[var(--primary-focus)]">
                  ไปหน้าเติม Point
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <Link href="/orders" className="utility-card group block">
                <h2 className="text-body-strong">ประวัติการซื้อ</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  ดูรหัสที่ซื้อแล้วและรายละเอียดการส่ง
                </p>
                <span className="text-caption mt-4 inline-flex items-center gap-1 text-[var(--primary)] transition-colors group-hover:text-[var(--primary-focus)]">
                  ดูประวัติ
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* ── Admin shortcuts ── */}
            {user.role === "admin" ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 animate-fade-in-up delay-3">
                <Link href="/admin/products" className="utility-card group block">
                  <h2 className="text-body-strong">Manage Products</h2>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                    Add products, set prices, and control visibility.
                  </p>
                  <span className="text-caption mt-4 inline-flex items-center gap-1 text-[var(--primary)]">
                    Products →
                  </span>
                </Link>
                <Link href="/admin/codes" className="utility-card group block">
                  <h2 className="text-body-strong">Manage Game Codes</h2>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                    Add ID and password stock for products.
                  </p>
                  <span className="text-caption mt-4 inline-flex items-center gap-1 text-[var(--primary)]">
                    Codes →
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
