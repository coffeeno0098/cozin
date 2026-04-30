import Link from "next/link";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    gameMap: string;
    description: string | null;
    pricePoints: number;
    availableCodes: number;
  };
};

function getStockDisplay(availableCodes: number) {
  if (availableCodes === 0) {
    return {
      label: "Out of stock",
      countText: "0 left",
      badgeClass: "badge-error",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "Low stock",
      countText: `Only ${availableCodes} left`,
      badgeClass: "badge-warning",
    };
  }

  return {
    label: "In stock",
    countText: `${availableCodes} left`,
    badgeClass: "badge-success",
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isInStock = product.availableCodes > 0;
  const stock = getStockDisplay(product.availableCodes);

  return (
    <article className="utility-card group animate-scale-in">
      {/* Header: map + stock */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-[var(--muted-foreground)]">
            {product.gameMap}
          </p>
          <h2 className="text-body-strong mt-1.5 truncate">{product.name}</h2>
        </div>
        <span className={stock.badgeClass}>{stock.label}</span>
      </div>

      {/* Description */}
      {product.description ? (
        <p className="mt-3 text-caption leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
          {product.description}
        </p>
      ) : null}

      {/* Price + stock count */}
      <div className="mt-5 flex items-end justify-between border-t border-[var(--hairline)] pt-4">
        <div>
          <p className="text-fine-print text-[var(--muted-foreground)]">Price</p>
          <p className="text-tagline tabular-nums mt-0.5">{product.pricePoints} <span className="text-caption font-normal">Point</span></p>
        </div>
        <div className="text-right">
          <p className="text-fine-print text-[var(--muted-foreground)]">Available</p>
          <p className="text-body-strong tabular-nums mt-0.5">{stock.countText}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/products/${product.slug}`}
        className="mt-5 flex items-center justify-center gap-1.5 text-body text-[var(--primary)] transition-colors hover:text-[var(--primary-focus)]"
      >
        {isInStock ? "View Product" : "View Details"}
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true" className="mt-px transition-transform group-hover:translate-x-0.5">
          <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </article>
  );
}
