import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { adminAuditLogs, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function formatReference(reference: string | null) {
  if (!reference) return "No target";
  if (reference.length <= 12) return reference;

  return `${reference.slice(0, 6)}...${reference.slice(-4)}`;
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Audit logs</h1>
            <p className="mt-1 text-sm text-muted-foreground">Latest important admin actions.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {auditRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No audit logs yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">New admin actions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditRows.map((log) => {
              const metadataEntries = formatMetadata(log.metadata);

              return (
                <article key={log.id} className="rounded-lg border p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{log.action}</h2>
                        <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                          {log.targetType}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {log.adminUsername ?? "Deleted admin"} / {log.createdAt.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <div className="rounded-md bg-secondary px-3 py-2 text-right">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="break-all font-semibold">{formatReference(log.targetId)}</p>
                    </div>
                  </div>

                  {metadataEntries.length > 0 ? (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {metadataEntries.map(([key, value]) => (
                        <div key={key} className="rounded-md border px-3 py-2">
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="mt-1 break-all text-sm font-medium">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
