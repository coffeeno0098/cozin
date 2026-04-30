import { count, sql } from "drizzle-orm";
import { BadgeCheck, Box, Coins, Megaphone, ReceiptText, ScrollText, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { adminAuditLogs, gameCodes, orders, payments, products, siteAnnouncements, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function getCount(
  table:
    | typeof users
    | typeof products
    | typeof gameCodes
    | typeof orders
    | typeof payments
    | typeof adminAuditLogs
    | typeof siteAnnouncements,
) {
  const [row] = await db.select({ value: count() }).from(table);

  return row.value;
}

export default async function AdminPage() {
  const currentUser = await requireAdmin();

  const [userCount, productCount, codeCount, orderCount, paymentCount, auditLogCount, announcementCount] = await Promise.all([
    getCount(users),
    getCount(products),
    getCount(gameCodes),
    getCount(orders),
    getCount(payments),
    getCount(adminAuditLogs),
    getCount(siteAnnouncements),
  ]);

  const [stockSummary] = await db
    .select({
      available: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      sold: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reserved: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
    })
    .from(gameCodes);

  const stats = [
    { label: "Users", value: userCount, icon: Users },
    { label: "Products", value: productCount, icon: Box },
    { label: "Game codes", value: codeCount, icon: BadgeCheck },
    { label: "Orders", value: orderCount, icon: ReceiptText },
    { label: "Payments", value: paymentCount, icon: Coins },
    { label: "Audit logs", value: auditLogCount, icon: ScrollText },
    { label: "Announcements", value: announcementCount, icon: Megaphone },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Store dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {currentUser.username}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/account">Back to account</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="rounded-lg border p-5">
                <Icon className="size-5 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Users</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review customer balances and apply audited manual Point adjustments.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/users">Manage users</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Products</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add Roblox code products, set point prices, and toggle product visibility.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/admin/products">Manage products</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Game-code stock</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add ID and password pairs to products. Available codes are ready to sell.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/codes">Manage codes</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Orders</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review fulfilled purchases, delivered code credentials, and customer order history.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/orders">View orders</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Payments</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review TrueMoney top-ups, verification status, granted points, and failed payment reasons.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/payments">View payments</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Announcements</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Publish a scrolling message for customers under the top navigation.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/announcements">Manage announcements</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">Audit logs</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review important admin actions such as product changes, map deletion, and code creation.
            </p>
            <Button className="mt-5" variant="outline" asChild>
              <Link href="/admin/audit-logs">View logs</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Stock overview</h2>
              <p className="mt-1 text-sm text-muted-foreground">Current game-code status across the store.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/codes">Manage stock</Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
              <p className="text-xs">Available</p>
              <p className="mt-1 text-2xl font-semibold">{stockSummary.available}</p>
            </div>
            <div className="rounded-md border px-3 py-2">
              <p className="text-xs text-muted-foreground">Sold</p>
              <p className="mt-1 text-2xl font-semibold">{stockSummary.sold}</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              <p className="text-xs">Reserved</p>
              <p className="mt-1 text-2xl font-semibold">{stockSummary.reserved}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">Next admin tools</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Stock summaries and manual point adjustments can plug into this dashboard next.
          </p>
        </div>
      </section>
    </main>
  );
}
