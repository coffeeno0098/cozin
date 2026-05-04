import Link from "next/link";

import { CodeManagementPanel } from "@/app/admin/codes/_components/code-management-panel";
import { getAdminCodeProductRows, getAdminCodeRows } from "@/app/admin/codes/code-data";
import { SiteNav } from "@/components/site-nav";
import { requireAdmin } from "@/lib/admin";

type ManageCodesPageProps = {
  searchParams?: Promise<{
    updated?: string;
    error?: string;
    q?: string;
    productId?: string;
    status?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getErrorMessage(error?: string) {
  if (error === "invalid") return "กรุณาตรวจสอบข้อมูลรหัส";
  if (error === "not-found") return "ไม่พบรหัสที่ต้องการแก้ไข";
  if (error === "locked") return "แก้ไขได้เฉพาะรหัสที่ยังพร้อมขายเท่านั้น";
  return "กรุณาตรวจสอบข้อมูลในฟอร์ม";
}

export default async function ManageCodesPage({ searchParams }: ManageCodesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const [codeRows, productRows] = await Promise.all([getAdminCodeRows(), getAdminCodeProductRows()]);

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
              <h1 className="text-display-lg mt-1">จัดการรหัสทั้งหมด</h1>
              <p className="text-body mt-1 text-[var(--muted-foreground)]">
                ค้นหา กรอง และแก้ Game ID/password เฉพาะรหัสที่ยังพร้อมขาย
              </p>
            </div>
            <Link href="/admin/codes" className="btn-pill-ghost px-6 py-3 text-caption">
              กลับไปเพิ่มรหัส
            </Link>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="mb-8 space-y-3">
              {params?.updated ? <div className="alert-success">อัปเดตรหัสแล้ว</div> : null}
              {params?.error ? <div className="alert-error">{getErrorMessage(params.error)}</div> : null}
            </div>

            <CodeManagementPanel codeRows={codeRows} productRows={productRows} searchParams={params} />
          </div>
        </section>
      </main>
    </>
  );
}
