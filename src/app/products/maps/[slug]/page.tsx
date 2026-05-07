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
        {/* ── Sub-nav with gradient accent ── */}
        <section className="sub-nav relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
            style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa, transparent)" }}
          />
          <h1 className="text-tagline" translate="no">{map.name}</h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-button-utility transition-colors hover:underline underline-offset-4"
            style={{ color: "#818cf8" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            กลับไปเลือก Map
          </Link>
        </section>

        {/* ── Content section ── */}
        <section className="tile-light tile-section relative overflow-hidden">
          {/* Decorative background glow */}
          <div
            className="pointer-events-none absolute -right-32 -top-32 hidden size-96 rounded-full opacity-[0.07] blur-[100px] lg:block"
            style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-caption text-[var(--muted-foreground)]">Map</p>
                  <h2 className="text-display-lg mt-0.5" translate="no">{map.name}</h2>
                </div>
              </div>
              <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
                เลือกสินค้าจาก Map นี้ได้เลย สามารถดูรายละเอียดก่อน แล้วค่อยเข้าสู่ระบบเมื่อพร้อมซื้อ
              </p>
            </div>

            <div className="mt-8">
              {products.length === 0 ? (
                <div className="relative animate-fade-in-up delay-1 overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-8 py-14 text-center">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{ background: "radial-gradient(ellipse at center, #818cf8, transparent 70%)" }}
                  />
                  <div className="relative">
                    <div
                      className="mx-auto grid size-16 place-items-center rounded-3xl text-white shadow-lg"
                      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.2)" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-body-strong mt-5">ยังไม่มีสินค้าใน Map นี้</h3>
                    <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                      เมื่อมีสินค้าที่เปิดขาย รายการจะแสดงในหน้านี้
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
