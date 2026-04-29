import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { gameCodes, gameMaps, orders, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orderRows = await db
    .select({
      id: orders.id,
      pricePoints: orders.pricePoints,
      status: orders.status,
      createdAt: orders.createdAt,
      username: users.username,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      gameAccountId: gameCodes.gameAccountId,
      gamePassword: gameCodes.gamePassword,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(products, eq(orders.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .innerJoin(gameCodes, eq(orders.gameCodeId, gameCodes.id))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Latest purchases and delivered code details.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {orderRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Customer purchases will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderRows.map((order) => (
              <article key={order.id} className="rounded-lg border p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{order.username}</p>
                    <h2 className="mt-1 text-lg font-semibold">{order.productName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.gameMap} / {order.createdAt.toLocaleString("th-TH")} / {order.status}
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary px-3 py-2 text-right">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-semibold">{order.pricePoints} Point</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Delivered ID</p>
                    <p className="mt-1 break-all font-medium">{order.gameAccountId}</p>
                  </div>
                  <div className="rounded-md border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Delivered password</p>
                    <p className="mt-1 break-all font-medium">{order.gamePassword}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
