import { desc, eq } from "drizzle-orm";

import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { adminAuditLogs, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

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

export default async function AdminAuditLogsPage() {
  await requireAdmin();

  const auditRows = await db
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
    .leftJoin(users, eq(adminAuditLogs.adminUserId, users.id))
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(100);

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Audit Logs</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Latest important admin actions.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-5">
            {auditRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">No Audit Logs Yet</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">New admin actions will appear here.</p>
              </div>
            ) : (
              auditRows.map((log, i) => {
                const metadataEntries = formatMetadata(log.metadata);
                return (
                  <article key={log.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-body-strong">{log.action}</h2>
                          <span className="badge-neutral">{log.targetType}</span>
                        </div>
                        <p className="text-fine-print mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                          {log.adminUsername ?? "Deleted admin"} · {log.createdAt.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Target</p>
                        <p className="text-caption-strong break-all">{formatReference(log.targetId)}</p>
                      </div>
                    </div>

                    {metadataEntries.length > 0 ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {metadataEntries.map(([key, value]) => (
                          <div key={key} className="rounded-xl border border-[var(--hairline)] px-4 py-2.5">
                            <p className="text-fine-print text-[var(--muted-foreground)]">{key}</p>
                            <p className="text-caption-strong mt-0.5 break-all">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
