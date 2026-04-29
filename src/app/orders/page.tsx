import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { gameCodes, gameMaps, orders, products } from "@/db/schema";

type OrdersPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const orderRows = await db
    .select({
      id: orders.id,
      pricePoints: orders.pricePoints,
      status: orders.status,
      createdAt: orders.createdAt,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      gameAccountId: gameCodes.gameAccountId,
      gamePassword: gameCodes.gamePassword,
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .innerJoin(gameCodes, eq(orders.gameCodeId, gameCodes.id))
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin account</p>
            <h1 className="text-2xl font-semibold">Purchase history</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </div>

        {params?.success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Purchase completed. Your code is available below.
          </div>
        ) : null}

        {orderRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No purchases yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Purchased codes will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderRows.map((order) => (
              <article key={order.id} className="rounded-lg border p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{order.gameMap}</p>
                    <h2 className="mt-1 text-lg font-semibold">{order.productName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.createdAt.toLocaleString("th-TH")} · {order.status}
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary px-3 py-2 text-right">
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-semibold">{order.pricePoints} Point</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border px-3 py-2">
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="mt-1 break-all font-medium">{order.gameAccountId}</p>
                  </div>
                  <div className="rounded-md border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Password</p>
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
