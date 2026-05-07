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
        {/* ── Hero header ── */}
        <section className="tile-light tile-section relative overflow-hidden">
          {/* Decorative background glow */}
          <div
            className="pointer-events-none absolute -right-32 -top-32 hidden size-96 rounded-full opacity-[0.07] blur-[100px] lg:block"
            style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 hidden size-72 rounded-full opacity-[0.05] blur-[80px] lg:block"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-display-lg">
                    เลือก Map ที่ต้องการ
                  </h2>
                  <p className="text-body mt-1 max-w-2xl text-[var(--muted-foreground)]">
                    เลือก Map ก่อน แล้วระบบจะแสดงสินค้ากับจำนวน Stock ที่เหลืออยู่ในหน้านั้น
                  </p>
                </div>
              </div>
            </div>

            {mapRows.length === 0 ? (
              <div className="relative mt-8 animate-fade-in-up delay-1 overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-8 py-14 text-center">
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
                  <h3 className="text-body-strong mt-5">ยังไม่มี Map ที่เปิดขาย</h3>
                  <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                    เมื่อมีสินค้าที่เปิดขาย Map จะแสดงในหน้านี้
                  </p>
                </div>
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
