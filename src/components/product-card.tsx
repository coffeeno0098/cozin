import Link from "next/link";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    gameMap: string;
    description: string | null;
    imageUrl: string | null;
    pricePoints: number;
    availableCodes: number;
  };
};

function getStockDisplay(availableCodes: number) {
  if (availableCodes === 0) {
    return {
      label: "หมด",
      countText: "0 ชิ้น",
      badgeClass: "product-card-badge product-card-badge--error",
      dotClass: "product-card-dot--error",
    };
  }

  if (availableCodes <= 2) {
    return {
      label: "เหลือน้อย",
      countText: `เหลือ ${availableCodes} ชิ้น`,
      badgeClass: "product-card-badge product-card-badge--warning",
      dotClass: "product-card-dot--warning",
    };
  }

  return {
    label: "มีสินค้า",
    countText: `${availableCodes} ชิ้น`,
    badgeClass: "product-card-badge product-card-badge--success",
    dotClass: "product-card-dot--success",
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const isInStock = product.availableCodes > 0;
  const stock = getStockDisplay(product.availableCodes);

  return (
    <article className="product-card group animate-scale-in">
      {/* ── Image Area ── */}
      <div className="product-card-image-area">
        {/* Map badge (top-left) */}
        <span className="product-card-map-badge" translate="no">
          {product.gameMap}
        </span>

        {/* Stock indicator (top-right) */}
        <span className={`product-card-stock-pill ${stock.dotClass}`}>
          <span className="product-card-stock-dot" />
          {stock.countText}
        </span>

        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain.
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="product-card-img"
          />
        ) : (
          <div className="product-card-img-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.25" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.25" />
              <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1" opacity="0.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="product-card-body">
        {/* Stock badge */}
        <div className="product-card-meta-row">
          <span className={stock.badgeClass}>{stock.label}</span>
        </div>

        {/* Product name */}
        <h2 className="product-card-name">{product.name}</h2>

        {/* Description (truncated) */}
        {product.description ? (
          <p className="product-card-desc">{product.description}</p>
        ) : null}

        {/* Price + CTA */}
        <div className="product-card-footer">
          <div className="product-card-price-block">
            <span className="product-card-price-label">ราคา</span>
            <span className="product-card-price-value">
              {product.pricePoints} <span className="product-card-price-unit">Point</span>
            </span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="product-card-cta"
          >
            {isInStock ? "ซื้อเลย" : "ดูรายละเอียด"}
          </Link>
        </div>
      </div>
    </article>
  );
}
