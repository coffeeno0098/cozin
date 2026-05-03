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
            กลับไปเลือก Map
          </Link>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <p className="text-caption text-[var(--muted-foreground)]">Map</p>
              <h2 className="text-display-lg mt-1" translate="no">{map.name}</h2>
              <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
                เลือกสินค้าจาก Map นี้ได้เลย สามารถดูรายละเอียดก่อน แล้วค่อยเข้าสู่ระบบเมื่อพร้อมซื้อ
              </p>
            </div>

            <div className="mt-8">
              {products.length === 0 ? (
                <div className="utility-card animate-fade-in-up delay-1">
                  <h3 className="text-body-strong">ยังไม่มีสินค้าใน Map นี้</h3>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                    เมื่อมีสินค้าที่เปิดขาย รายการจะแสดงในหน้านี้
                  </p>
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
