import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { getPublicMapWithProducts } from "@/lib/products";

type MapProductsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function MapProductsPage({ params }: MapProductsPageProps) {
  const { slug } = await params;
  const result = await getPublicMapWithProducts(slug);

  if (!result) {
    notFound();
  }

  const { map, products } = result;

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="sub-nav">
          <h1 className="text-tagline" translate="no">{map.name}</h1>
          <Link
            href="/products"
            className="text-button-utility text-[var(--primary)] hover:underline underline-offset-4"
          >
            Back to Maps
          </Link>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="animate-fade-in-up">
                {map.imageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface-parchment)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */}
                    <img
                      src={map.imageUrl}
                      alt={map.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-caption mt-6 text-[var(--muted-foreground)]">Map</p>
                <h2 className="text-display-lg mt-1" translate="no">{map.name}</h2>
                <p className="text-body mt-3 text-[var(--muted-foreground)]">
                  Choose a product from this map. You can browse first, then login when you are ready to buy.
                </p>
              </div>

              <div>
                {products.length === 0 ? (
                  <div className="utility-card animate-fade-in-up delay-1">
                    <h3 className="text-body-strong">No Products Yet</h3>
                    <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                      Active products for this map will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
