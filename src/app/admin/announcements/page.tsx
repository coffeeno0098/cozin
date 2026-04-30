import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { createAnnouncementAction, toggleAnnouncementAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Announcements</h1>
            <p className="mt-1 text-sm text-muted-foreground">Publish scrolling messages for customers.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {params?.created ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Announcement created.
          </div>
        ) : null}
        {params?.updated ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Announcement updated.
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form action={createAnnouncementAction} className="space-y-4 rounded-lg border p-5">
          <div>
            <h2 className="font-semibold">New announcement</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest active announcement is shown as a scrolling bar under the top navigation.
            </p>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Message</span>
            <textarea
              name="message"
              required
              maxLength={500}
              placeholder="เว็บจะปิดปรับปรุงภายในเวลา 12.00 น."
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="isActive" type="checkbox" defaultChecked className="size-4" />
            Active immediately
          </label>
          <Button type="submit">Publish announcement</Button>
        </form>

        {announcementRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No announcements yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Published announcements will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcementRows.map((announcement) => (
              <article key={announcement.id} className="rounded-lg border p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-1 text-xs ${
                          announcement.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {announcement.isActive ? "Active" : "Hidden"}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {announcement.createdByUsername ?? "Deleted admin"} / {announcement.createdAt.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <p className="mt-3 text-base font-medium">{announcement.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated {announcement.updatedAt.toLocaleString("th-TH")}
                    </p>
                  </div>
                  <form action={toggleAnnouncementAction}>
                    <input type="hidden" name="announcementId" value={announcement.id} />
                    <input type="hidden" name="isActive" value={String(!announcement.isActive)} />
                    <Button type="submit" variant="outline">
                      {announcement.isActive ? "Hide" : "Show"}
                    </Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
