import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { siteAnnouncements } from "@/db/schema";

export async function AnnouncementBar() {
  const [announcement] = await db
    .select({
      message: siteAnnouncements.message,
    })
    .from(siteAnnouncements)
    .where(eq(siteAnnouncements.isActive, true))
    .orderBy(desc(siteAnnouncements.createdAt))
    .limit(1);

  if (!announcement) {
    return null;
  }

  return (
    <div className="tile-parchment overflow-hidden border-b border-[var(--hairline)]">
      <div className="cozin-marquee py-2.5 text-caption whitespace-nowrap">
        <span className="px-4">{announcement.message}</span>
      </div>
    </div>
  );
}
