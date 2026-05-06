import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { adminAuditLogs, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { normalizeAdminSearch } from "@/lib/admin-list-filters";

export const dynamic = "force-dynamic";

const auditLogsPerPage = 20;

type AdminAuditLogsPageProps = {
  searchParams?: Promise<{
    q?: string;
    action?: string;
    targetType?: string;
    page?: string;
  }>;
};

function formatReference(reference: string | null) {
  if (!reference) return "No target";
  if (reference.length <= 12) return reference;

  return `${reference.slice(0, 6)}…${reference.slice(-4)}`;
}

function formatMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }

  return Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null && value !== "");
}

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function normalizeFacet(value: string | undefined) {
  const normalized = normalizeAdminSearch(value);
  if (!normalized || normalized === "all") {
    return null;
  }

  return normalized;
}

function buildAuditLogsPageHref(page: number, query: string, action: string | null, targetType: string | null) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (action) params.set("action", action);
  if (targetType) params.set("targetType", targetType);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();

  return search ? `/admin/audit-logs?${search}` : "/admin/audit-logs";
}

function renderMetadataValue(value: unknown) {
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default async function AdminAuditLogsPage({ searchParams }: AdminAuditLogsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = normalizeAdminSearch(params?.q);
  const selectedAction = normalizeFacet(params?.action);
  const selectedTargetType = normalizeFacet(params?.targetType);
  const requestedPage = parsePage(params?.page);
  const conditions: SQL[] = [];

  if (selectedAction) {
    conditions.push(eq(adminAuditLogs.action, selectedAction));
  }

  if (selectedTargetType) {
    conditions.push(eq(adminAuditLogs.targetType, selectedTargetType));
  }

  if (query) {
    const likeQuery = `%${query}%`;
    const searchCondition = or(
      ilike(users.username, likeQuery),
      ilike(adminAuditLogs.action, likeQuery),
      ilike(adminAuditLogs.targetType, likeQuery),
      sql`cast(${adminAuditLogs.targetId} as text) ilike ${likeQuery}`,
      sql`cast(${adminAuditLogs.id} as text) ilike ${likeQuery}`,
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const auditCountQuery = db
    .select({ value: count() })
    .from(adminAuditLogs)
    .leftJoin(users, eq(adminAuditLogs.adminUserId, users.id));
  const [{ value: totalAuditLogs }] = await (whereClause ? auditCountQuery.where(whereClause) : auditCountQuery);
  const totalPages = Math.max(1, Math.ceil(totalAuditLogs / auditLogsPerPage));
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * auditLogsPerPage;

  const auditQuery = db
    .select({
      id: adminAuditLogs.id,
      action: adminAuditLogs.action,
      targetType: adminAuditLogs.targetType,
      targetId: adminAuditLogs.targetId,
      metadata: adminAuditLogs.metadata,
      createdAt: adminAuditLogs.createdAt,
      adminUsername: users.username,
    })
    .from(adminAuditLogs)
    .leftJoin(users, eq(adminAuditLogs.adminUserId, users.id));

  const [auditRows, actionOptions, targetTypeOptions] = await Promise.all([
    (whereClause ? auditQuery.where(whereClause) : auditQuery)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(auditLogsPerPage)
      .offset(offset),
    db
      .select({ value: adminAuditLogs.action })
      .from(adminAuditLogs)
      .groupBy(adminAuditLogs.action)
      .orderBy(asc(adminAuditLogs.action)),
    db
      .select({ value: adminAuditLogs.targetType })
      .from(adminAuditLogs)
      .groupBy(adminAuditLogs.targetType)
      .orderBy(asc(adminAuditLogs.targetType)),
  ]);

  const hasFilters = Boolean(query || selectedAction || selectedTargetType);
  const firstVisible = totalAuditLogs === 0 ? 0 : offset + 1;
  const lastVisible = offset + auditRows.length;

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Audit Logs</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">
              ตรวจสอบประวัติการทำงานสำคัญของ admin แบบค้นหาและแบ่งหน้า
            </p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-5">
            <form action="/admin/audit-logs" className="utility-card grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
              <label className="block space-y-2">
                <span className="text-caption-strong">ค้นหา Log</span>
                <input
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="admin, action, target type, target id"
                  spellCheck={false}
                  className="input-apple"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-caption-strong">Action</span>
                <select name="action" defaultValue={selectedAction ?? "all"} className="input-apple">
                  <option value="all">ทุก action</option>
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-caption-strong">Target Type</span>
                <select name="targetType" defaultValue={selectedTargetType ?? "all"} className="input-apple">
                  <option value="all">ทุก target</option>
                  {targetTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-2">
                <button type="submit" className="btn-pill px-5 py-3 text-caption">
                  ค้นหา
                </button>
                {hasFilters ? (
                  <Link href="/admin/audit-logs" className="btn-pill-ghost px-5 py-3 text-caption">
                    ล้าง
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="flex flex-col gap-2 text-caption text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                แสดง {firstVisible}-{lastVisible} จาก {totalAuditLogs} รายการ
              </p>
              <p>หน้า {currentPage} จาก {totalPages}</p>
            </div>

            {auditRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">{hasFilters ? "ไม่พบ Audit Logs ที่ตรงกับตัวกรอง" : "ยังไม่มี Audit Logs"}</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  {hasFilters ? "ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองปัจจุบัน" : "เมื่อ admin ทำ action สำคัญ ประวัติจะแสดงที่นี่"}
                </p>
              </div>
            ) : (
              <div className="utility-card overflow-hidden p-0 animate-fade-in-up">
                <div className="hidden grid-cols-[180px_1fr_170px_160px_120px] gap-4 border-b border-[var(--hairline)] px-5 py-3 text-fine-print text-[var(--muted-foreground)] lg:grid">
                  <span>เวลา</span>
                  <span>Action</span>
                  <span>Target</span>
                  <span>Admin</span>
                  <span className="text-right">รายละเอียด</span>
                </div>

                <div className="divide-y divide-[var(--hairline)]">
                  {auditRows.map((log) => {
                    const metadataEntries = formatMetadata(log.metadata);

                    return (
                      <article key={log.id} className="px-5 py-4">
                        <div className="grid gap-3 lg:grid-cols-[180px_1fr_170px_160px_120px] lg:items-center">
                          <p className="text-caption text-[var(--muted-foreground)]" suppressHydrationWarning>
                            {log.createdAt.toLocaleString("th-TH")}
                          </p>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-caption-strong truncate">{log.action}</h2>
                              <span className="badge-neutral">{log.targetType}</span>
                            </div>
                            <p className="text-fine-print mt-1 text-[var(--muted-foreground)] lg:hidden">
                              Target {formatReference(log.targetId)} · {log.adminUsername ?? "Deleted admin"}
                            </p>
                          </div>

                          <p className="hidden text-caption-strong break-all lg:block">{formatReference(log.targetId)}</p>
                          <p className="hidden truncate text-caption text-[var(--muted-foreground)] lg:block">
                            {log.adminUsername ?? "Deleted admin"}
                          </p>

                          <div className="lg:text-right">
                            {metadataEntries.length > 0 ? (
                              <span className="text-caption-strong text-[var(--primary)]">ดูด้านล่าง</span>
                            ) : (
                              <span className="text-caption text-[var(--muted-foreground)]">ไม่มี metadata</span>
                            )}
                          </div>
                        </div>

                        {metadataEntries.length > 0 ? (
                          <details className="mt-3">
                            <summary className="cursor-pointer list-none text-caption-strong text-[var(--primary)] transition hover:opacity-80 lg:text-right">
                              ดู metadata
                            </summary>
                            <div className="mt-4 grid max-h-72 gap-3 overflow-auto rounded-2xl border border-[var(--hairline)] bg-[var(--surface-parchment)] p-3 text-left md:grid-cols-2">
                              {metadataEntries.map(([key, value]) => (
                                <div key={key} className="min-w-0 rounded-xl border border-[var(--hairline)] px-4 py-2.5">
                                  <p className="text-fine-print text-[var(--muted-foreground)]">{key}</p>
                                  <p className="text-caption-strong mt-0.5 whitespace-pre-wrap break-words">
                                    {renderMetadataValue(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {totalPages > 1 ? (
              <nav className="utility-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Audit logs pagination">
                {currentPage > 1 ? (
                  <Link
                    href={buildAuditLogsPageHref(currentPage - 1, query, selectedAction, selectedTargetType)}
                    className="btn-pill-ghost px-5 py-2.5 text-center text-caption"
                  >
                    ก่อนหน้า
                  </Link>
                ) : (
                  <span className="btn-pill-ghost px-5 py-2.5 text-center text-caption opacity-40">ก่อนหน้า</span>
                )}
                <span className="text-center text-caption text-[var(--muted-foreground)]">
                  หน้า {currentPage} จาก {totalPages} · {firstVisible}-{lastVisible} / {totalAuditLogs}
                </span>
                {currentPage < totalPages ? (
                  <Link
                    href={buildAuditLogsPageHref(currentPage + 1, query, selectedAction, selectedTargetType)}
                    className="btn-pill px-5 py-2.5 text-center text-caption"
                  >
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
