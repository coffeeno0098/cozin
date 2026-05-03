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
    <div className="announcement-strip overflow-hidden">
      <div className="cozin-marquee announcement-marquee whitespace-nowrap">
        <span className="px-8">{announcement.message}</span>
      </div>
    </div>
  );
}
