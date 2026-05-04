import Link from "next/link";

import { AddCodeForm } from "@/app/admin/codes/_components/add-code-form";
import { getAdminCodeProductRows } from "@/app/admin/codes/code-data";
import { SiteNav } from "@/components/site-nav";
import { requireAdmin } from "@/lib/admin";

type CodesPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getStockBadge(availableCodes: number) {
  if (availableCodes === 0) return { label: "สินค้าหมด", badgeClass: "badge-error" };
  if (availableCodes <= 2) return { label: "เหลือน้อย", badgeClass: "badge-warning" };
  return { label: "พร้อมขาย", badgeClass: "badge-success" };
}

export default async function CodesPage({ searchParams }: CodesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const productRows = await getAdminCodeProductRows();
  const lowStockProductRows = productRows
    .filter((product) => product.isActive && product.availableCodes <= 2)
    .sort((a, b) => a.availableCodes - b.availableCodes || a.name.localeCompare(b.name))
    .slice(0, 8);

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
              <h1 className="text-display-lg mt-1">รหัสเกมใน Stock</h1>
              <p className="text-body mt-1 text-[var(--muted-foreground)]">
                เพิ่ม Roblox account ID และ password สำหรับสินค้าที่พร้อมขาย
              </p>
            </div>
            <Link href="/admin/codes/manage" className="btn-pill-ghost px-6 py-3 text-caption">
              จัดการรหัสทั้งหมด
            </Link>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="mb-8 space-y-3">
              {params?.created ? <div className="alert-success">เพิ่มรหัสเข้า stock แล้ว</div> : null}
              {params?.error ? <div className="alert-error">กรุณาตรวจสอบฟอร์มเพิ่มรหัส</div> : null}
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <AddCodeForm productRows={productRows} />

              <div className="utility-card animate-fade-in-up delay-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-body-strong">สินค้าที่ควรเติมรหัส</h2>
                    <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                      แสดงเฉพาะสินค้าที่เปิดขายและเหลือรหัสน้อย
                    </p>
                  </div>
                  <Link href="/admin/codes/manage" className="text-caption-strong text-[var(--primary)] hover:underline">
                    เปิดหน้าจัดการรหัส
                  </Link>
                </div>
                {lowStockProductRows.length === 0 ? (
                  <p className="text-caption mt-4 text-[var(--muted-foreground)]">
                    ตอนนี้ไม่มีสินค้าที่ต้องเติมรหัส
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {lowStockProductRows.map((product) => {
                      const stock = getStockBadge(product.availableCodes);
                      return (
                        <div key={product.id} className="rounded-xl border border-[var(--hairline)] px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-caption-strong truncate">{product.name}</h3>
                              <p className="text-fine-print mt-0.5 text-[var(--muted-foreground)]">{product.gameMap}</p>
                            </div>
                            <span className={stock.badgeClass}>{stock.label}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                            <div>
                              <p className="text-fine-print text-[var(--muted-foreground)]">พร้อมขาย</p>
                              <p className="text-caption-strong mt-0.5 tabular-nums">{product.availableCodes}</p>
                            </div>
                            <div>
                              <p className="text-fine-print text-[var(--muted-foreground)]">ขายแล้ว</p>
                              <p className="text-caption-strong mt-0.5 tabular-nums">{product.soldCodes}</p>
                            </div>
                            <div>
                              <p className="text-fine-print text-[var(--muted-foreground)]">จองไว้</p>
                              <p className="text-caption-strong mt-0.5 tabular-nums">{product.reservedCodes}</p>
                            </div>
                            <div>
                              <p className="text-fine-print text-[var(--muted-foreground)]">ทั้งหมด</p>
                              <p className="text-caption-strong mt-0.5 tabular-nums">{product.totalCodes}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
