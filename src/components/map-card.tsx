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
      className="utility-card group block animate-scale-in overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1"
    >
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
        <div className="aspect-[16/10] rounded-[22px] border border-white/10 bg-[#050505]" />
      )}

      <div className="px-4 pb-4 pt-6">
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
            <p className="text-fine-print text-[var(--muted-foreground)]">สินค้า</p>
            <p className="text-tagline tabular-nums mt-0.5">{map.productCount}</p>
          </div>
          <div className="text-right">
            <p className="text-fine-print text-[var(--muted-foreground)]">Stock</p>
            <p className="text-tagline tabular-nums mt-0.5">{map.availableCodes}</p>
          </div>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-body text-[var(--primary)] transition-colors group-hover:text-[var(--primary-focus)]">
          ดูสินค้า
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="mt-px transition-transform group-hover:translate-x-0.5">
            <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
      </div>
    </Link>
  );
}
