import Link from "next/link";

type MapCardProps = {
  map: {
    slug: string;
    name: string;
    imageUrl: string | null;
    productCount: number;
    availableCodes: number;
  };
};

export function MapCard({ map }: MapCardProps) {
  return (
    <Link
      href={`/products/maps/${map.slug}`}
      className="utility-card group relative block animate-scale-in overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(129,140,248,0.08)]"
    >
      {/* ── Gradient accent bar ── */}
      <div
        className="h-1"
        style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
      />

      <div className="p-3">
        {map.imageUrl ? (
          <div className="aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10 bg-[#050505]">
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */}
            <img
              src={map.imageUrl}
              alt={map.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.015]"
            />
          </div>
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-white/10 bg-[#050505]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ background: "radial-gradient(ellipse at center, #818cf8, transparent 70%)" }}
            />
            <div className="grid h-full place-items-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/20">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-[var(--muted-foreground)]">Map</p>
            <h2 className="mt-1.5 truncate text-2xl font-bold leading-tight tracking-normal text-[var(--foreground)]" translate="no">
              {map.name}
            </h2>
          </div>
          <span className={map.availableCodes > 0 ? "badge-success" : "badge-error"}>
            {map.availableCodes > 0 ? "มีสินค้า" : "สินค้าหมด"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--hairline)] pt-4">
          <div>
            <p className="flex items-center gap-1.5 text-fine-print text-[var(--muted-foreground)]">
              <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
              สินค้า
            </p>
            <p className="text-tagline tabular-nums mt-0.5">{map.productCount}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-fine-print text-[var(--muted-foreground)]">
              <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
              Stock
            </p>
            <p className="text-tagline tabular-nums mt-0.5">{map.availableCodes}</p>
          </div>
        </div>

        <div
          className="mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-body font-medium transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(96,165,250,0.08) 100%)",
            color: "#818cf8",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ดูสินค้า
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="mt-px transition-transform group-hover:translate-x-0.5">
            <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
