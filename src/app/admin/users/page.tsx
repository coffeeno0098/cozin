import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { adjustUserPointsAction } from "@/app/admin/actions";
import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { pointTransactions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    adjusted?: string;
    error?: string;
    q?: string;
    role?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "กรุณาตรวจสอบฟอร์มปรับ Point",
  "not-found": "ไม่พบสมาชิกที่ต้องการปรับ Point",
  negative: "ไม่สามารถปรับได้ เพราะจะทำให้ Point ของสมาชิกติดลบ",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;
  const query = params?.q?.trim() ?? "";
  const selectedRole = params?.role ?? "all";
  const normalizedQuery = query.toLowerCase();
  const hasFilters = Boolean(query || selectedRole !== "all");

  const [userRows, recentAdjustments] = await Promise.all([
    db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        points: users.points,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100),
    db
      .select({
        id: pointTransactions.id,
        username: users.username,
        points: pointTransactions.points,
        balanceAfter: pointTransactions.balanceAfter,
        note: pointTransactions.note,
        createdAt: pointTransactions.createdAt,
      })
      .from(pointTransactions)
      .innerJoin(users, eq(pointTransactions.userId, users.id))
      .where(eq(pointTransactions.type, "adjustment"))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(10),
  ]);

  const filteredUserRows = userRows.filter((user) => {
    const matchesQuery = normalizedQuery
      ? [user.username, user.email ?? ""].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const matchesRole = selectedRole === "all" ? true : user.role === selectedRole;

    return matchesQuery && matchesRole;
  });

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]">
              <span translate="no">Cozin</span> Admin
            </p>
            <h1 className="text-display-lg mt-1">สมาชิก</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">
              ตรวจสอบยอด Point และปรับ Point ให้สมาชิกแบบมีประวัติและ audit log
            </p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-6">
            <div aria-live="polite" className="space-y-3">
              {params?.adjusted ? <div className="alert-success">ปรับ Point เรียบร้อยแล้ว</div> : null}
              {errorMessage ? <div className="alert-error">{errorMessage}</div> : null}
            </div>

            <section className="utility-card animate-fade-in-up">
              <h2 className="text-body-strong">ประวัติการปรับ Point ล่าสุด</h2>
              {recentAdjustments.length === 0 ? (
                <p className="text-caption mt-3 text-[var(--muted-foreground)]">ยังไม่มีการปรับ Point แบบ manual</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentAdjustments.map((adjustment) => (
                    <div key={adjustment.id} className="rounded-xl border border-[var(--hairline)] px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-caption-strong">{adjustment.username}</p>
                          <p className="text-fine-print mt-0.5 text-[var(--muted-foreground)]" suppressHydrationWarning>
                            {adjustment.createdAt.toLocaleString("th-TH")} · ยอดหลังปรับ {adjustment.balanceAfter} Point
                          </p>
                        </div>
                        <p className={`text-caption-strong tabular-nums ${adjustment.points > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {adjustment.points > 0 ? "+" : ""}
                          {adjustment.points} Point
                        </p>
                      </div>
                      {adjustment.note ? <p className="text-caption mt-2 text-[var(--muted-foreground)]">{adjustment.note}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div>
                <h2 className="text-display-lg">รายชื่อสมาชิก</h2>
                <p className="text-caption text-[var(--muted-foreground)]">
                  แสดง {filteredUserRows.length} จาก {userRows.length} คนล่าสุด
                </p>
              </div>

              <form action="/admin/users" className="utility-card grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
                <label className="block space-y-2">
                  <span className="text-caption-strong">ค้นหาสมาชิก</span>
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="username หรือ email"
                    spellCheck={false}
                    className="input-apple"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-caption-strong">Role</span>
                  <select name="role" defaultValue={selectedRole} className="input-apple">
                    <option value="all">ทั้งหมด</option>
                    <option value="customer">ลูกค้า</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <div className="flex gap-2">
                  <button type="submit" className="btn-pill px-5 py-3 text-caption">
                    ค้นหา
                  </button>
                  {hasFilters ? (
                    <Link href="/admin/users" className="btn-pill-ghost px-5 py-3 text-caption">
                      ล้าง
                    </Link>
                  ) : null}
                </div>
              </form>

              {userRows.length === 0 ? (
                <div className="utility-card">
                  <h2 className="text-body-strong">ยังไม่มีสมาชิก</h2>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">เมื่อมีคนสมัครสมาชิก รายชื่อจะแสดงที่นี่</p>
                </div>
              ) : filteredUserRows.length === 0 ? (
                <div className="utility-card text-caption text-[var(--muted-foreground)]">ไม่พบสมาชิกที่ตรงกับตัวกรอง</div>
              ) : (
                filteredUserRows.map((user, i) => (
                  <article key={user.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-body-strong truncate">{user.username}</h3>
                          <span className={user.role === "admin" ? "badge-warning" : "badge-neutral"}>
                            {user.role === "admin" ? "Admin" : "ลูกค้า"}
                          </span>
                        </div>
                        <p className="text-caption mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                          {user.email ?? "ไม่มี email"} · สมัครเมื่อ {user.createdAt.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Point ปัจจุบัน</p>
                        <p className="text-body-strong tabular-nums">{user.points} Point</p>
                      </div>
                    </div>

                    <details className="mt-5 border-t border-[var(--hairline)] pt-4">
                      <summary className="cursor-pointer list-none text-caption-strong text-[var(--primary)] transition hover:opacity-80">
                        ปรับ Point
                      </summary>
                      <form action={adjustUserPointsAction} className="mt-4 grid gap-3 lg:grid-cols-[10rem_1fr_auto]">
                        <input type="hidden" name="userId" value={user.id} />
                        <label className="block space-y-1.5">
                          <span className="text-caption-strong">จำนวน Point</span>
                          <input name="pointsDelta" type="number" step={1} required placeholder="+10 หรือ -5" className="input-apple" />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="text-caption-strong">เหตุผล</span>
                          <input
                            name="reason"
                            required
                            minLength={3}
                            maxLength={500}
                            placeholder="เช่น แก้ไขยอดเติมเงิน หรือชดเชยปัญหา"
                            className="input-apple"
                          />
                        </label>
                        <div className="flex items-end">
                          <button type="submit" className="btn-pill-ghost px-4 py-2 text-caption">
                            บันทึก
                          </button>
                        </div>
                        <p className="text-fine-print text-[var(--muted-foreground)] lg:col-span-3">
                          ใช้เลขบวกเพื่อเพิ่ม Point หรือเลขลบเพื่อลด Point ระบบจะไม่ยอมให้ยอดหลังปรับติดลบ
                        </p>
                      </form>
                    </details>
                  </article>
                ))
              )}
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
