import { Coins, History, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { getPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getPublicProducts(3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 sm:px-8 lg:px-10">
        <SiteNav />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              Owner-run Roblox code shop with automatic delivery after purchase.
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                Buy Roblox codes for Blox Fruit and popular maps
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Browse products before logging in. Add Point with TrueMoney later, then use Point to buy game codes
                instantly from your purchase history.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                  <Coins className="size-4" />
                  Add Point
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">View products</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Example product</p>
                <h2 className="mt-2 text-2xl font-semibold">Captain</h2>
                <p className="mt-1 text-sm text-muted-foreground">Map Blox Fruit</p>
              </div>
              <div className="rounded-md bg-secondary px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-semibold">10 Point</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="mt-2 text-2xl font-semibold">10</p>
              </div>
            </div>
          </div>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available now</p>
                <h2 className="text-2xl font-semibold">Featured products</h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products">All products</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <Coins className="size-5" />
            <h3 className="mt-4 font-semibold">TrueMoney to Point</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Customers will submit a TrueMoney gift link to add Point automatically.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <LockKeyhole className="size-5" />
            <h3 className="mt-4 font-semibold">Automatic code delivery</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              After purchase, the selected code is attached to the order and shown in purchase history.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <History className="size-5" />
            <h3 className="mt-4 font-semibold">Clear history</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Point top-ups, purchases, and balance changes are stored as a ledger for reliable support.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
