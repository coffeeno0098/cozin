import Link from "next/link";

import { updateProductAction } from "@/app/admin/actions";
import type { AdminMapRow, AdminProductRow } from "@/app/admin/products/product-data";

type ProductManagementPanelProps = {
  productRows: AdminProductRow[];
  mapRows: Pick<AdminMapRow, "id" | "name">[];
  searchParams?: {
    q?: string;
    mapId?: string;
    status?: string;
  };
  basePath: "/admin/products" | "/admin/products/manage";
};

function getStockBadge(availableCodes: number) {
  if (availableCodes === 0) return { label: "สินค้าหมด", badgeClass: "badge-error" };
  if (availableCodes <= 2) return { label: "เหลือน้อย", badgeClass: "badge-warning" };
  return { label: "มีสินค้า", badgeClass: "badge-success" };
}

export function ProductManagementPanel({ productRows, mapRows, searchParams, basePath }: ProductManagementPanelProps) {
  const query = searchParams?.q?.trim() ?? "";
  const selectedMapId = searchParams?.mapId ?? "";
  const selectedStatus = searchParams?.status ?? "all";
  const normalizedQuery = query.toLowerCase();
  const hasProductFilters = Boolean(query || selectedMapId || selectedStatus !== "all");
  const filteredProductRows = productRows.filter((product) => {
    const matchesQuery = normalizedQuery
      ? [product.name, product.gameMap, product.description ?? ""].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const matchesMap = selectedMapId ? product.mapId === selectedMapId : true;
    const matchesStatus =
      selectedStatus === "active"
        ? product.isActive
        : selectedStatus === "hidden"
          ? !product.isActive
          : selectedStatus === "out"
            ? product.availableCodes === 0
            : selectedStatus === "low"
              ? product.availableCodes > 0 && product.availableCodes <= 2
              : true;

    return matchesQuery && matchesMap && matchesStatus;
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-display-lg">จัดการสินค้า</h2>
          <p className="text-caption text-[var(--muted-foreground)]">
            แสดง {filteredProductRows.length} จาก {productRows.length} รายการ
          </p>
        </div>
      </div>

      <form action={basePath} className="utility-card grid gap-4 md:grid-cols-[1fr_220px_180px_auto] md:items-end">
        <label className="block space-y-2">
          <span className="text-caption-strong">ค้นหาสินค้า</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="ชื่อสินค้า, Map, รายละเอียด"
            spellCheck={false}
            className="input-apple"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-caption-strong">Map</span>
          <select name="mapId" defaultValue={selectedMapId} className="input-apple">
            <option value="">ทุก Map</option>
            {mapRows.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-caption-strong">สถานะ</span>
          <select name="status" defaultValue={selectedStatus} className="input-apple">
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดขาย</option>
            <option value="hidden">ซ่อนอยู่</option>
            <option value="low">เหลือน้อย</option>
            <option value="out">สินค้าหมด</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-pill px-5 py-3 text-caption">
            ค้นหา
          </button>
          {hasProductFilters ? (
            <Link href={basePath} className="btn-pill-ghost px-5 py-3 text-caption">
              ล้าง
            </Link>
          ) : null}
        </div>
      </form>

      {productRows.length === 0 ? (
        <div className="utility-card text-caption text-[var(--muted-foreground)]">ยังไม่มีสินค้า</div>
      ) : filteredProductRows.length === 0 ? (
        <div className="utility-card text-caption text-[var(--muted-foreground)]">ไม่พบสินค้าที่ตรงกับตัวกรอง</div>
      ) : (
        <div className="grid gap-4">
          {filteredProductRows.map((product, i) => {
            const stockBadge = getStockBadge(product.availableCodes);

            return (
              <div key={product.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    {product.imageUrl ? (
                      <div className="aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] sm:w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-body-strong truncate">{product.name}</h3>
                        <span className={product.isActive ? "badge-success" : "badge-neutral"}>
                          {product.isActive ? "เปิดขาย" : "ซ่อนอยู่"}
                        </span>
                        <span className={stockBadge.badgeClass}>{stockBadge.label}</span>
                      </div>
                      <p className="text-caption mt-1 text-[var(--muted-foreground)]">{product.gameMap}</p>
                      {product.description ? (
                        <p className="text-caption mt-2 line-clamp-2 text-[var(--muted-foreground)]">{product.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:min-w-64">
                    <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                      <p className="text-fine-print text-[var(--muted-foreground)]">ราคา</p>
                      <p className="text-body-strong tabular-nums">{product.pricePoints}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                      <p className="text-fine-print text-[var(--muted-foreground)]">พร้อมขาย</p>
                      <p className="text-body-strong tabular-nums">{product.availableCodes}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                      <p className="text-fine-print text-[var(--muted-foreground)]">ขายแล้ว</p>
                      <p className="text-body-strong tabular-nums">{product.soldCodes}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--hairline)] px-3 py-2 text-center">
                      <p className="text-fine-print text-[var(--muted-foreground)]">กันไว้ / ทั้งหมด</p>
                      <p className="text-body-strong tabular-nums">
                        {product.reservedCodes} / {product.totalCodes}
                      </p>
                    </div>
                  </div>
                </div>

                <details className="mt-4 border-t border-[var(--hairline)] pt-4">
                  <summary className="cursor-pointer list-none text-caption-strong text-[var(--primary)] transition hover:opacity-80">
                    แก้ไขสินค้า
                  </summary>
                  <form action={updateProductAction} className="mt-4">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="returnTo" value={basePath} />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-caption-strong">ชื่อสินค้า</span>
                        <input name="name" defaultValue={product.name} required spellCheck={false} className="input-apple" />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-caption-strong">ราคา Point</span>
                        <input name="pricePoints" type="number" min={1} defaultValue={product.pricePoints} required className="input-apple" />
                      </label>
                      <label className="block space-y-2 lg:col-span-2">
                        <span className="text-caption-strong">รูปสินค้า URL</span>
                        <input
                          name="imageUrl"
                          type="url"
                          defaultValue={product.imageUrl ?? ""}
                          placeholder="https://example.com/product.png"
                          spellCheck={false}
                          className="input-apple"
                        />
                      </label>
                      <label className="block space-y-2 lg:col-span-2">
                        <span className="text-caption-strong">รายละเอียดสินค้า</span>
                        <textarea name="description" defaultValue={product.description ?? ""} className="textarea-apple min-h-28" />
                      </label>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-center gap-2 text-caption">
                        <input name="isActive" type="checkbox" defaultChecked={product.isActive} className="size-4 accent-[var(--primary)]" />
                        เปิดขาย
                      </label>
                      <button type="submit" className="btn-pill px-6 py-2 text-caption">
                        บันทึกสินค้า
                      </button>
                    </div>
                  </form>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
