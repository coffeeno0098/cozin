import { Gamepad2 } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const productRows = await getPublicProducts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between border-b pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">Cozin</p>
              <p className="text-sm text-muted-foreground">Roblox Code Shop</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </nav>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Products</p>
          <h1 className="text-3xl font-semibold tracking-normal">Roblox codes ready to buy with Point</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Browse available products before logging in. You will need an account before buying any code.
          </p>
        </div>

        {productRows.length === 0 ? (
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold">No active products yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Products added by the admin will appear here when they are active.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productRows.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
