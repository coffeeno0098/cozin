import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import { getPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuredProducts = await getPublicProducts(3);

  return (
    <>
      <SiteNav />

      <main id="main-content" className="home-black flex-1">
        <section className="home-hero tile-dark tile-section">
          <div className="home-hero-shell mx-auto flex max-w-6xl flex-col items-center text-center">
            <div className="home-hero-kicker animate-fade-in">
              Owner-run digital code shop
            </div>
            <h1 className="home-hero-title animate-fade-in-up" translate="no">
              Cozin
            </h1>
            <p className="home-hero-subtitle animate-fade-in-up delay-1">
              เลือกสินค้า เติม Point แล้วรับรหัสเกมอัตโนมัติในประวัติการซื้อ
            </p>
          </div>
        </section>

        {featuredProducts.length > 0 ? (
          <section className="tile-light tile-section">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-caption text-[var(--muted-foreground)]">
                    Available now
                  </p>
                  <h2 className="text-display-lg mt-1">Featured Products</h2>
                </div>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="tile-dark-2 tile-section">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="animate-fade-in-up">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="var(--primary-on-dark)" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" stroke="var(--primary-on-dark)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-tagline mt-5 text-white">
                <span translate="no">TrueMoney</span> to Point
              </h3>
              <p className="text-body mt-3 text-[var(--text-muted-dark)]">
                Submit a <span translate="no">TrueMoney</span> gift link to add
                Point automatically. 1 Baht = 1 Point.
              </p>
            </div>
            <div className="animate-fade-in-up delay-1">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="var(--primary-on-dark)" strokeWidth="1.5" />
                  <path d="M3 10h18" stroke="var(--primary-on-dark)" strokeWidth="1.5" />
                  <circle cx="7" cy="14" r="1" fill="var(--primary-on-dark)" />
                </svg>
              </div>
              <h3 className="text-tagline mt-5 text-white">
                Automatic Code Delivery
              </h3>
              <p className="text-body mt-3 text-[var(--text-muted-dark)]">
                After purchase, the game code credentials appear instantly in
                your purchase history.
              </p>
            </div>
            <div className="animate-fade-in-up delay-2">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="var(--primary-on-dark)" strokeWidth="1.5" />
                  <path d="M9 12l2 2 4-4" stroke="var(--primary-on-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-tagline mt-5 text-white">
                Clear History
              </h3>
              <p className="text-body mt-3 text-[var(--text-muted-dark)]">
                Point top-ups, purchases, and balance changes are stored as a
                ledger for reliable support.
              </p>
            </div>
          </div>
        </section>

        <footer className="tile-parchment py-10 text-center">
          <p className="text-fine-print text-[var(--muted-foreground)]">
            © {new Date().getFullYear()}{" "}
            <span translate="no">Cozin</span>. Owner-run{" "}
            <span translate="no">Roblox</span> code shop.
          </p>
        </footer>
      </main>
    </>
  );
}
