import Link from "next/link";

import { createMapAction, createProductAction, deleteMapAction, updateMapImageAction } from "@/app/admin/actions";
import { getAdminMapRows } from "@/app/admin/products/product-data";
import { SiteNav } from "@/components/site-nav";
import { requireAdmin } from "@/lib/admin";

type ProductsPageProps = {
  searchParams?: Promise<{
    created?: string;
    mapCreated?: string;
    mapUpdated?: string;
    mapDeleted?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getErrorMessage(error?: string) {
  if (error === "map-in-use") return "Map นี้ยังมีสินค้าใช้งานอยู่";
  if (error === "invalid-map-image") return "กรุณากรอก URL รูปภาพ Map ให้ถูกต้อง";
  if (error === "invalid-map") return "กรุณากรอกชื่อ Map และ URL รูปภาพให้ถูกต้อง";
  if (error === "duplicate-map") return "มี Map ชื่อนี้อยู่แล้ว";
  if (error === "map") return "กรุณาเลือก Map ก่อนสร้างสินค้า";
  if (error === "invalid-product") return "กรุณาตรวจสอบข้อมูลสินค้า";
  if (error === "product-not-found") return "ไม่พบสินค้าที่ต้องการแก้ไข";
  return "กรุณาตรวจสอบข้อมูลในฟอร์ม";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const mapRows = await getAdminMapRows();

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]">
              <span translate="no">Cozin</span> Admin
            </p>
            <h1 className="text-display-lg mt-1">สินค้าและ Map</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">
              หน้านี้ใช้สำหรับสร้างสินค้าใหม่ และจัดการ Map โดยไม่ต้องเลื่อนผ่านรายการสินค้าจำนวนมาก
            </p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl">
            <div aria-live="polite" className="mb-8 space-y-3">
              {params?.created ? <div className="alert-success">สร้างสินค้าแล้ว</div> : null}
              {params?.mapCreated ? <div className="alert-success">สร้าง Map แล้ว</div> : null}
              {params?.mapUpdated ? <div className="alert-success">อัปเดตรูป Map แล้ว</div> : null}
              {params?.mapDeleted ? <div className="alert-success">ลบ Map แล้ว</div> : null}
              {params?.error ? <div className="alert-error">{getErrorMessage(params.error)}</div> : null}
            </div>

            <div className="space-y-10">
              <section className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-caption text-[var(--muted-foreground)]">ส่วนที่ใช้บ่อย</p>
                    <h2 className="text-display-lg mt-1">สร้างสินค้าใหม่</h2>
                  </div>
                  <Link href="/admin/products/manage" className="btn-pill-ghost px-6 py-3 text-caption">
                    จัดการสินค้าทั้งหมด
                  </Link>
                </div>

                <form action={createProductAction} className="utility-card grid gap-5 animate-fade-in-up lg:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-caption-strong">ชื่อสินค้า</span>
                      <input name="name" required spellCheck={false} className="input-apple" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">เลือก Map</span>
                      <select name="mapId" required className="input-apple">
                        <option value="">เลือก Map สำหรับสินค้านี้</option>
                        {mapRows.map((map) => (
                          <option key={map.id} value={map.id}>
                            {map.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-fine-print text-[var(--muted-foreground)]">
                        ถ้ายังไม่มี Map ให้สร้างจากส่วนด้านล่างก่อน
                      </span>
                    </label>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">ราคา Point</span>
                      <input name="pricePoints" type="number" min={1} required className="input-apple" />
                    </label>
                    <label className="flex items-center gap-2 text-caption">
                      <input name="isActive" type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
                      เปิดขายทันที
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-caption-strong">รูปสินค้า URL</span>
                      <input
                        name="imageUrl"
                        type="url"
                        placeholder="https://example.com/product.png"
                        spellCheck={false}
                        className="input-apple"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">รายละเอียดสินค้า</span>
                      <textarea name="description" className="textarea-apple min-h-36" />
                    </label>
                    <button type="submit" className="btn-pill w-full">
                      สร้างสินค้า
                    </button>
                  </div>
                </form>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="text-caption text-[var(--muted-foreground)]">ตั้งค่าหมวดสินค้า</p>
                  <h2 className="text-display-lg mt-1">สร้างและจัดการ Map</h2>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                  <form action={createMapAction} className="utility-card space-y-4 animate-fade-in-up">
                    <div>
                      <h3 className="text-body-strong">สร้าง Map ใหม่</h3>
                      <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                        สร้างครั้งเดียว แล้วนำไปเลือกตอนสร้างสินค้า
                      </p>
                    </div>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">ชื่อ Map</span>
                      <input name="name" required placeholder="Blox Fruit" spellCheck={false} className="input-apple" />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-caption-strong">รูป Map URL</span>
                      <input
                        name="imageUrl"
                        type="url"
                        placeholder="https://example.com/map.png"
                        spellCheck={false}
                        className="input-apple"
                      />
                    </label>
                    <button type="submit" className="btn-pill w-full">
                      สร้าง Map
                    </button>
                  </form>

                  <div className="utility-card animate-fade-in-up delay-1">
                    <h3 className="text-body-strong">Map ทั้งหมด</h3>
                    <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                      ลบ Map ได้เฉพาะตอนที่ยังไม่มีสินค้าใช้งาน
                    </p>
                    <div className="mt-4 grid gap-3">
                      {mapRows.length === 0 ? (
                        <p className="text-caption text-[var(--muted-foreground)]">ยังไม่มี Map</p>
                      ) : (
                        mapRows.map((map) => (
                          <div key={map.id} className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-parchment)] p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              {map.imageUrl ? (
                                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--background)] sm:w-28">
                                  {/* eslint-disable-next-line @next/next/no-img-element -- Admin-provided image URLs can come from any domain. */}
                                  <img
                                    src={map.imageUrl}
                                    alt={map.name}
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-caption">
                                  <span className="font-medium" translate="no">
                                    {map.name}
                                  </span>
                                  <span className="text-[var(--muted-foreground)] tabular-nums">({map.productCount})</span>
                                </div>
                                <form action={updateMapImageAction} className="mt-2 flex flex-col gap-2 sm:flex-row">
                                  <input type="hidden" name="mapId" value={map.id} />
                                  <input
                                    name="imageUrl"
                                    type="url"
                                    defaultValue={map.imageUrl ?? ""}
                                    placeholder="Map image URL"
                                    spellCheck={false}
                                    className="input-apple min-h-10 text-caption sm:flex-1"
                                  />
                                  <button type="submit" className="btn-pill-ghost px-4 py-2 text-caption">
                                    บันทึก
                                  </button>
                                </form>
                              </div>
                              <form action={deleteMapAction}>
                                <input type="hidden" name="mapId" value={map.id} />
                                <button
                                  type="submit"
                                  disabled={map.productCount > 0}
                                  className="text-fine-print text-[var(--primary)] hover:underline disabled:cursor-not-allowed disabled:text-[var(--muted-foreground)]"
                                >
                                  ลบ
                                </button>
                              </form>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
