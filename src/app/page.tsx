import Link from "next/link";

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
        {/* ══════════ HERO ══════════ */}
        <section className="home-hero tile-dark tile-section">
          <div className="home-hero-shell mx-auto flex max-w-6xl flex-col items-center text-center">
            {/* Kicker badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(96,165,250,0.1) 100%)", border: "1px solid rgba(129,140,248,0.2)" }}
            >
              <span className="inline-block size-2 animate-pulse rounded-full" style={{ background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.5)" }} />
              <span className="text-[12px] font-bold tracking-wide text-white/80">
                Roblox Account Store
              </span>
            </div>

            <h1 className="home-hero-title animate-fade-in-up" translate="no">
              Cozin
            </h1>
            <p className="home-hero-subtitle animate-fade-in-up delay-1">
              เลือกสินค้า เติม Point แล้วรับรหัสเกมอัตโนมัติในประวัติการซื้อ
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-4 delay-2">
              <Link
                href="/products"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 text-[15px] font-bold text-white transition hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
                  boxShadow: "0 8px 32px rgba(129,140,248,0.35)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                ดูสินค้าทั้งหมด
              </Link>
              <Link
                href="/topup"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border px-8 text-[15px] font-bold text-white/90 transition hover:bg-white/[0.06] hover:text-white"
                style={{ borderColor: "rgba(129,140,248,0.25)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#a78bfa" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                เติม Point
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-12 flex animate-fade-in-up flex-wrap items-center justify-center gap-8 delay-3">
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-white">24/7</p>
                <p className="text-[11px] font-semibold tracking-wide text-white/45">AUTOMATED</p>
              </div>
              <div className="h-8 w-px" style={{ background: "rgba(129,140,248,0.2)" }} />
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-white">Instant</p>
                <p className="text-[11px] font-semibold tracking-wide text-white/45">DELIVERY</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FEATURED PRODUCTS ══════════ */}
        {featuredProducts.length > 0 ? (
          <section className="tile-light tile-section relative overflow-hidden">
            <div className="relative mx-auto max-w-6xl">
              <div className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-caption text-[var(--muted-foreground)]">
                      <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                      สินค้าที่มีตอนนี้
                    </p>
                    <h2 className="text-display-lg mt-0.5">สินค้าพร้อมขาย</h2>
                  </div>
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

        {/* ══════════ FEATURES / HOW IT WORKS ══════════ */}
        <section className="tile-dark-2 tile-section relative overflow-hidden">
          {/* Background decoration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 hidden h-px w-[60%] -translate-x-1/2 lg:block"
            style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.2), transparent)" }}
          />

          <div className="mx-auto max-w-5xl">
            {/* Section header */}
            <div className="mb-12 text-center">
              <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>How it works</p>
              <h2 className="text-display-lg mt-2 text-white">ซื้อง่ายใน 3 ขั้นตอน</h2>
              <p className="text-body mx-auto mt-3 max-w-lg text-white/55">
                ระบบอัตโนมัติทำงานตลอด 24 ชั่วโมง ไม่ต้องรอแอดมิน
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group animate-fade-in-up rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-[rgba(167,139,250,0.2)] hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)", boxShadow: "0 6px 20px rgba(167,139,250,0.25)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-white/30">01</span>
                </div>
                <h3 className="text-tagline mt-5 text-white">
                  <span translate="no">TrueMoney</span> to Point
                </h3>
                <p className="text-body mt-3 text-white/55">
                  ส่งลิงก์ซอง <span translate="no">TrueMoney</span> เพื่อเติม Point อัตโนมัติ
                  <br />1 บาท = 1 Point
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group animate-fade-in-up delay-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-[rgba(129,140,248,0.2)] hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)", boxShadow: "0 6px 20px rgba(129,140,248,0.25)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-white/30">02</span>
                </div>
                <h3 className="text-tagline mt-5 text-white">
                  เลือกซื้อสินค้า
                </h3>
                <p className="text-body mt-3 text-white/55">
                  เลือก Map และสินค้าที่ต้องการ กดซื้อแล้วระบบจะจัดส่งรหัสให้ทันที
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group animate-fade-in-up delay-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-[rgba(96,165,250,0.2)] hover:bg-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)", boxShadow: "0 6px 20px rgba(96,165,250,0.25)" }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-white/30">03</span>
                </div>
                <h3 className="text-tagline mt-5 text-white">
                  รับรหัสทันที
                </h3>
                <p className="text-body mt-3 text-white/55">
                  ID และ Password จะปรากฏในประวัติการซื้อ พร้อมปุ่มคัดลอกสะดวก
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="relative overflow-hidden py-10 text-center" style={{ background: "#000" }}>
          {/* Gradient divider */}
          <div
            className="absolute inset-x-0 top-0 mx-auto h-px w-[50%]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.3), transparent)" }}
          />

          <p className="text-fine-print text-white/40">
            © {new Date().getFullYear()}{" "}
            <span
              translate="no"
              className="font-bold"
              style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Cozin
            </span>
            . Owner-run{" "}
            <span translate="no">Roblox</span> code shop.
          </p>
        </footer>
      </main>
    </>
  );
}
