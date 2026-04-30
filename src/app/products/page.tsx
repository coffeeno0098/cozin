import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { getPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const productRows = await getPublicProducts();

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        {/* ── Header (parchment sub-nav) ── */}
        <section className="sub-nav">
          <h1 className="text-tagline" translate="no">Products</h1>
          <Link
            href="/"
            className="text-button-utility text-[var(--primary)] hover:underline underline-offset-4"
          >
            Home
          </Link>
        </section>

        {/* ── Product grid ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <h2 className="text-display-lg">
                <span translate="no">Roblox</span> Codes Ready to Buy with Point
              </h2>
              <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
                Browse available products before logging in. You will need an
                account before buying any code.
              </p>
            </div>

            {productRows.length === 0 ? (
              <div className="utility-card mt-8 animate-fade-in-up delay-1">
                <h3 className="text-body-strong">No Active Products Yet</h3>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  Products added by the admin will appear here when they are
                  active.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {productRows.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
