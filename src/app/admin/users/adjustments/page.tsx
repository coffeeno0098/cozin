import { and, count, desc, eq, gt, ilike, lt, or, type SQL } from "drizzle-orm";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { pointTransactions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type AdminAdjustmentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    kind?: string;
    page?: string;
  }>;
};

const adjustmentsPerPage = 20;

export const dynamic = "force-dynamic";

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function parseKind(value?: string) {
  if (value === "increase" || value === "decrease") {
    return value;
  }

  return null;
}

function buildAdjustmentsPageHref(page: number, query: string, kind: "increase" | "decrease" | null) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (kind) params.set("kind", kind);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();

  return search ? `/admin/users/adjustments?${search}` : "/admin/users/adjustments";
}

export default async function AdminAdjustmentsPage({ searchParams }: AdminAdjustmentsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const selectedKind = parseKind(params?.kind);
  const requestedPage = parsePage(params?.page);
  const hasFilters = Boolean(query || selectedKind);
  const conditions: SQL[] = [eq(pointTransactions.type, "adjustment")];

  if (selectedKind === "increase") {
    conditions.push(gt(pointTransactions.points, 0));
  }

  if (selectedKind === "decrease") {
    conditions.push(lt(pointTransactions.points, 0));
  }

  if (query) {
    const likeQuery = `%${query}%`;
    const searchCondition = or(ilike(users.username, likeQuery), ilike(pointTransactions.note, likeQuery));

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = and(...conditions);
  const adjustmentCountQuery = db
    .select({ value: count() })
    .from(pointTransactions)
    .innerJoin(users, eq(pointTransactions.userId, users.id));
  const [{ value: totalAdjustments }] = await adjustmentCountQuery.where(whereClause);
  const totalPages = Math.max(1, Math.ceil(totalAdjustments / adjustmentsPerPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * adjustmentsPerPage;
  const adjustmentRows = await db
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
    .where(whereClause)
    .orderBy(desc(pointTransactions.createdAt))
    .limit(adjustmentsPerPage)
    .offset(offset);
  const firstVisible = totalAdjustments === 0 ? 0 : offset + 1;
  const lastVisible = offset + adjustmentRows.length;

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 animate-fade-in-up lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption text-[var(--muted-foreground)]">
                <span translate="no">Cozin</span> Admin
              </p>
              <h1 className="text-display-lg mt-1">ประวัติการปรับ Point</h1>
              <p className="text-body mt-1 text-[var(--muted-foreground)]">
                ดูรายการปรับ Point ทั้งหมด พร้อมค้นหาเหตุผลและสมาชิกย้อนหลัง
              </p>
            </div>
            <Link href="/admin/users" className="btn-pill-ghost px-6 py-3 text-caption">
              กลับไปรายชื่อสมาชิก
            </Link>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-5">
            <form action="/admin/users/adjustments" className="utility-card grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
              <label className="block space-y-2">
                <span className="text-caption-strong">ค้นหาประวัติ</span>
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="username หรือเหตุผล"
                  spellCheck={false}
                  className="input-apple"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-caption-strong">ประเภท</span>
                <select name="kind" defaultValue={selectedKind ?? "all"} className="input-apple">
                  <option value="all">ทั้งหมด</option>
                  <option value="increase">เพิ่ม Point</option>
                  <option value="decrease">ลด Point</option>
                </select>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-pill px-5 py-3 text-caption">
                  ค้นหา
                </button>
                {hasFilters ? (
                  <Link href="/admin/users/adjustments" className="btn-pill-ghost px-5 py-3 text-caption">
                    ล้าง
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="flex flex-col gap-2 text-caption text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                แสดง {firstVisible}-{lastVisible} จาก {totalAdjustments} รายการ
              </p>
              <p>หน้า {currentPage} จาก {totalPages}</p>
            </div>

            {adjustmentRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">{hasFilters ? "ไม่พบประวัติที่ตรงกับตัวกรอง" : "ยังไม่มีประวัติการปรับ Point"}</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  {hasFilters ? "ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรอง" : "เมื่อมีการปรับ Point รายการทั้งหมดจะแสดงที่นี่"}
                </p>
              </div>
            ) : (
              adjustmentRows.map((adjustment, i) => (
                <article key={adjustment.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-body-strong truncate">{adjustment.username}</h2>
                      <p className="text-fine-print mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                        {adjustment.createdAt.toLocaleString("th-TH")} · ยอดหลังปรับ {adjustment.balanceAfter} Point
                      </p>
                    </div>
                    <p className={`text-caption-strong tabular-nums ${adjustment.points > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {adjustment.points > 0 ? "+" : ""}
                      {adjustment.points} Point
                    </p>
                  </div>
                  {adjustment.note ? <p className="text-caption mt-3 text-[var(--muted-foreground)]">{adjustment.note}</p> : null}
                </article>
              ))
            )}

            {totalPages > 1 ? (
              <nav className="utility-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Point adjustment pagination">
                {currentPage > 1 ? (
                  <Link href={buildAdjustmentsPageHref(currentPage - 1, query, selectedKind)} className="btn-pill-ghost px-5 py-2.5 text-center text-caption">
                    ก่อนหน้า
                  </Link>
                ) : (
                  <span className="btn-pill-ghost px-5 py-2.5 text-center text-caption opacity-40">ก่อนหน้า</span>
                )}
                <span className="text-center text-caption text-[var(--muted-foreground)]">
                  {firstVisible}-{lastVisible} / {totalAdjustments}
                </span>
                {currentPage < totalPages ? (
                  <Link href={buildAdjustmentsPageHref(currentPage + 1, query, selectedKind)} className="btn-pill px-5 py-2.5 text-center text-caption">
                    ถัดไป
                  </Link>
                ) : (
                  <span className="btn-pill px-5 py-2.5 text-center text-caption opacity-40">ถัดไป</span>
                )}
              </nav>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
