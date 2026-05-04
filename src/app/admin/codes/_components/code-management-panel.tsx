import Link from "next/link";

import { updateCodeAction } from "@/app/admin/actions";
import type { AdminCodeProductRow, AdminCodeRow } from "@/app/admin/codes/code-data";

type CodeManagementPanelProps = {
  codeRows: AdminCodeRow[];
  productRows: Pick<AdminCodeProductRow, "id" | "name" | "gameMap">[];
  searchParams?: {
    q?: string;
    productId?: string;
    status?: string;
  };
};

function getStatusBadge(status: "available" | "reserved" | "sold") {
  if (status === "available") return "badge-success";
  if (status === "reserved") return "badge-warning";
  return "badge-neutral";
}

function getStatusLabel(status: "available" | "reserved" | "sold") {
  if (status === "available") return "พร้อมขาย";
  if (status === "reserved") return "จองไว้";
  return "ขายแล้ว";
}

export function CodeManagementPanel({ codeRows, productRows, searchParams }: CodeManagementPanelProps) {
  const query = searchParams?.q?.trim() ?? "";
  const selectedProductId = searchParams?.productId ?? "";
  const selectedStatus = searchParams?.status ?? "all";
  const normalizedQuery = query.toLowerCase();
  const hasFilters = Boolean(query || selectedProductId || selectedStatus !== "all");
  const filteredCodeRows = codeRows.filter((code) => {
    const matchesQuery = normalizedQuery
      ? [code.gameAccountId, code.productName, code.gameMap].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const matchesProduct = selectedProductId ? code.productId === selectedProductId : true;
    const matchesStatus = selectedStatus === "all" ? true : code.status === selectedStatus;

    return matchesQuery && matchesProduct && matchesStatus;
  });

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-display-lg">จัดการรหัส</h2>
        <p className="text-caption text-[var(--muted-foreground)]">
          แสดง {filteredCodeRows.length} จาก {codeRows.length} รายการ
        </p>
      </div>

      <form action="/admin/codes/manage" className="utility-card grid gap-4 md:grid-cols-[1fr_260px_180px_auto] md:items-end">
        <label className="block space-y-2">
          <span className="text-caption-strong">ค้นหารหัส</span>
          <input
            name="q"
            defaultValue={query}
            placeholder="Game ID, ชื่อสินค้า, Map"
            spellCheck={false}
            className="input-apple"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-caption-strong">สินค้า</span>
          <select name="productId" defaultValue={selectedProductId} className="input-apple">
            <option value="">ทุกสินค้า</option>
            {productRows.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {product.gameMap}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-caption-strong">สถานะ</span>
          <select name="status" defaultValue={selectedStatus} className="input-apple">
            <option value="all">ทั้งหมด</option>
            <option value="available">พร้อมขาย</option>
            <option value="reserved">จองไว้</option>
            <option value="sold">ขายแล้ว</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn-pill px-5 py-3 text-caption">
            ค้นหา
          </button>
          {hasFilters ? (
            <Link href="/admin/codes/manage" className="btn-pill-ghost px-5 py-3 text-caption">
              ล้าง
            </Link>
          ) : null}
        </div>
      </form>

      {codeRows.length === 0 ? (
        <div className="utility-card text-caption text-[var(--muted-foreground)]">ยังไม่มีรหัสใน stock</div>
      ) : filteredCodeRows.length === 0 ? (
        <div className="utility-card text-caption text-[var(--muted-foreground)]">ไม่พบรหัสที่ตรงกับตัวกรอง</div>
      ) : (
        <div className="grid gap-4">
          {filteredCodeRows.map((code, i) => (
            <div key={code.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body-strong truncate">{code.productName}</h3>
                    <span className={getStatusBadge(code.status)}>{getStatusLabel(code.status)}</span>
                  </div>
                  <p className="text-caption mt-1 text-[var(--muted-foreground)]">{code.gameMap}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[28rem]">
                  <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-2.5">
                    <p className="text-fine-print text-[var(--muted-foreground)]">Game ID</p>
                    <p className="text-caption-strong mt-0.5 break-all">{code.gameAccountId}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-parchment)] px-4 py-2.5">
                    <p className="text-fine-print text-[var(--muted-foreground)]">วันที่เพิ่ม</p>
                    <p className="text-caption-strong mt-0.5" suppressHydrationWarning>
                      {code.createdAt.toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              </div>

              {code.status === "available" ? (
                <details className="mt-4 border-t border-[var(--hairline)] pt-4">
                  <summary className="cursor-pointer list-none text-caption-strong text-[var(--primary)] transition hover:opacity-80">
                    แก้ไขรหัส
                  </summary>
                  <form action={updateCodeAction} className="mt-4 grid gap-4 lg:grid-cols-2">
                    <input type="hidden" name="codeId" value={code.id} />
                    <label className="block space-y-2">
                      <span className="text-caption-strong">Game ID</span>
                      <input name="gameAccountId" defaultValue={code.gameAccountId} required spellCheck={false} className="input-apple" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">Game Password ใหม่</span>
                      <input
                        name="gamePassword"
                        placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน"
                        spellCheck={false}
                        className="input-apple"
                      />
                    </label>
                    <p className="text-fine-print text-[var(--muted-foreground)] lg:col-span-2">
                      เพื่อความปลอดภัย ระบบไม่แสดง password เดิม และจะแก้ได้เฉพาะรหัสที่ยังพร้อมขายเท่านั้น
                    </p>
                    <div className="lg:col-span-2">
                      <button type="submit" className="btn-pill px-6 py-2 text-caption">
                        บันทึกรหัส
                      </button>
                    </div>
                  </form>
                </details>
              ) : (
                <p className="mt-4 border-t border-[var(--hairline)] pt-4 text-fine-print text-[var(--muted-foreground)]">
                  รหัสนี้ถูกจองหรือขายแล้ว จึงไม่เปิดให้แก้ไขเพื่อป้องกันการกระทบประวัติคำสั่งซื้อ
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
