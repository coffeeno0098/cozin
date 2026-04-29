import { count } from "drizzle-orm";
import { BadgeCheck, Box, Coins, ReceiptText, Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { gameCodes, orders, payments, products, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

async function getCount(table: typeof users | typeof products | typeof gameCodes | typeof orders | typeof payments) {
  const [row] = await db.select({ value: count() }).from(table);

  return row.value;
}

export default async function AdminPage() {
  const currentUser = await requireAdmin();

  const [userCount, productCount, codeCount, orderCount, paymentCount] = await Promise.all([
    getCount(users),
    getCount(products),
    getCount(gameCodes),
    getCount(orders),
    getCount(payments),
  ]);

  const stats = [
    { label: "Users", value: userCount, icon: Users },
    { label: "Products", value: productCount, icon: Box },
    { label: "Game codes", value: codeCount, icon: BadgeCheck },
    { label: "Orders", value: orderCount, icon: ReceiptText },
    { label: "Payments", value: paymentCount, icon: Coins },
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <div className="grid gap-4 md:grid-cols-2">
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
        </div>

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">Next admin tools</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Order review and payment verification views will plug into this dashboard after product stock is ready.
          </p>
        </div>
      </section>
    </main>
  );
}
