import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { createAnnouncementAction, toggleAnnouncementAction } from "@/app/admin/actions";
import { db } from "@/db";
import { siteAnnouncements, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type AdminAnnouncementsPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
    updated?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "Please check the announcement form.",
  "not-found": "Announcement was not found.",
};

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage({ searchParams }: AdminAnnouncementsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;
  const announcementRows = await db
    .select({
      id: siteAnnouncements.id,
      message: siteAnnouncements.message,
      isActive: siteAnnouncements.isActive,
      createdAt: siteAnnouncements.createdAt,
      updatedAt: siteAnnouncements.updatedAt,
      createdByUsername: users.username,
    })
    .from(siteAnnouncements)
    .leftJoin(users, eq(siteAnnouncements.createdByUserId, users.id))
    .orderBy(desc(siteAnnouncements.createdAt))
    .limit(100);

  return (
    <>
      <div className="global-nav">
        <Link href="/admin" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">Cozin Admin</Link>
        <Link href="/admin" className="text-nav-link opacity-85 hover:opacity-100">← Dashboard</Link>
      </div>

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Announcements</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Publish scrolling messages for customers.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-6">
            <div aria-live="polite" className="space-y-3">
              {params?.created ? <div className="alert-success">Announcement created.</div> : null}
              {params?.updated ? <div className="alert-success">Announcement updated.</div> : null}
              {errorMessage ? <div className="alert-error">{errorMessage}</div> : null}
            </div>

            {/* ── Create form ── */}
            <form action={createAnnouncementAction} className="utility-card space-y-4 animate-fade-in-up">
              <div>
                <h2 className="text-body-strong">New Announcement</h2>
                <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                  The latest active announcement is shown as a scrolling bar under the top navigation.
                </p>
              </div>
              <label className="block space-y-2">
                <span className="text-caption-strong">Message</span>
                <textarea
                  name="message"
                  required
                  maxLength={500}
                  placeholder="เว็บจะปิดปรับปรุงภายในเวลา 12.00 น.…"
                  className="textarea-apple"
                />
              </label>
              <label className="flex items-center gap-2 text-caption">
                <input name="isActive" type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
                Active immediately
              </label>
              <button type="submit" className="btn-pill">Publish Announcement</button>
            </form>

            {/* ── Announcement list ── */}
            {announcementRows.length === 0 ? (
              <div className="utility-card">
                <h2 className="text-body-strong">No Announcements Yet</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">Published announcements will appear here.</p>
              </div>
            ) : (
              announcementRows.map((announcement, i) => (
                <article key={announcement.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={announcement.isActive ? "badge-success" : "badge-neutral"}>
                          {announcement.isActive ? "Active" : "Hidden"}
                        </span>
                        <p className="text-fine-print text-[var(--muted-foreground)]" suppressHydrationWarning>
                          {announcement.createdByUsername ?? "Deleted admin"} · {announcement.createdAt.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <p className="text-body mt-3">{announcement.message}</p>
                      <p className="text-fine-print mt-2 text-[var(--muted-foreground)]" suppressHydrationWarning>
                        Updated {announcement.updatedAt.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <form action={toggleAnnouncementAction} className="shrink-0">
                      <input type="hidden" name="announcementId" value={announcement.id} />
                      <input type="hidden" name="isActive" value={String(!announcement.isActive)} />
                      <button type="submit" className="btn-pill-ghost text-caption px-4 py-2">
                        {announcement.isActive ? "Hide" : "Show"}
                      </button>
                    </form>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
