import Link from "next/link";

import { MapCard } from "@/components/map-card";
import { SiteNav } from "@/components/site-nav";
import { getPublicMaps } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const mapRows = await getPublicMaps();

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="sub-nav">
          <h1 className="text-tagline" translate="no">Products</h1>
          <Link
            href="/"
            className="text-button-utility text-[var(--primary)] hover:underline underline-offset-4"
          >
            Home
          </Link>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <h2 className="text-display-lg">
                Choose a <span translate="no">Roblox</span> Map
              </h2>
              <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
                Start by selecting a map. Products and available stock will appear inside each map page.
              </p>
            </div>

            {mapRows.length === 0 ? (
              <div className="utility-card mt-8 animate-fade-in-up delay-1">
                <h3 className="text-body-strong">No Active Maps Yet</h3>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  Maps will appear here when they have active products.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {mapRows.map((map) => (
                  <MapCard key={map.id} map={map} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
