import Link from "next/link";

import { ProductManagementPanel } from "@/app/admin/products/_components/product-management-panel";
import { getAdminMapRows, getAdminProductRows } from "@/app/admin/products/product-data";
import { SiteNav } from "@/components/site-nav";
import { requireAdmin } from "@/lib/admin";

type ManageProductsPageProps = {
  searchParams?: Promise<{
    updated?: string;
    error?: string;
    q?: string;
    mapId?: string;
    status?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getErrorMessage(error?: string) {
  if (error === "invalid-product") return "กรุณาตรวจสอบข้อมูลสินค้า";
  if (error === "product-not-found") return "ไม่พบสินค้าที่ต้องการแก้ไข";
  return "กรุณาตรวจสอบข้อมูลในฟอร์ม";
}

export default async function ManageProductsPage({ searchParams }: ManageProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const [productRows, mapRows] = await Promise.all([getAdminProductRows(), getAdminMapRows()]);

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 animate-fade-in-up lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption text-[var(--muted-foreground)]">
                <span translate="no">Cozin</span> Admin
              </p>
              <h1 className="text-display-lg mt-1">จัดการสินค้าทั้งหมด</h1>
              <p className="text-body mt-1 text-[var(--muted-foreground)]">
                ค้นหา กรอง และแก้ไขสินค้าโดยไม่ชนกับหน้าสร้างสินค้าและจัดการ Map
              </p>
            </div>
            <Link href="/admin/products" className="btn-pill-ghost px-6 py-3 text-caption">
              กลับไปสร้างสินค้า
            </Link>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="mb-8 space-y-3">
              {params?.updated ? <div className="alert-success">อัปเดตสินค้าแล้ว</div> : null}
              {params?.error ? <div className="alert-error">{getErrorMessage(params.error)}</div> : null}
            </div>

            <ProductManagementPanel
              productRows={productRows}
              mapRows={mapRows}
              searchParams={params}
              basePath="/admin/products/manage"
            />
          </div>
        </section>
      </main>
    </>
  );
}
