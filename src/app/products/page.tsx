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
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <h2 className="text-display-lg">
                เลือก Map ที่ต้องการ
              </h2>
              <p className="text-body mt-3 max-w-2xl text-[var(--muted-foreground)]">
                เลือก Map ก่อน แล้วระบบจะแสดงสินค้ากับจำนวน Stock ที่เหลืออยู่ในหน้านั้น
              </p>
            </div>

            {mapRows.length === 0 ? (
              <div className="utility-card mt-8 animate-fade-in-up delay-1">
                <h3 className="text-body-strong">ยังไม่มี Map ที่เปิดขาย</h3>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  เมื่อมีสินค้าที่เปิดขาย Map จะแสดงในหน้านี้
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
