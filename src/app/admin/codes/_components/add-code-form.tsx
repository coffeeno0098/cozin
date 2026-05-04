"use client";

import { useMemo, useState } from "react";

import { createCodeAction } from "@/app/admin/actions";
import type { AdminCodeProductRow } from "@/app/admin/codes/code-data";

type AddCodeFormProps = {
  productRows: AdminCodeProductRow[];
};

export function AddCodeForm({ productRows }: AddCodeFormProps) {
  const activeProducts = useMemo(() => productRows.filter((product) => product.isActive), [productRows]);
  const mapOptions = useMemo(() => {
    const optionMap = new Map<string, string>();

    for (const product of activeProducts) {
      const key = product.mapId ?? product.gameMap;
      if (!optionMap.has(key)) {
        optionMap.set(key, product.gameMap);
      }
    }

    return Array.from(optionMap, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProducts]);

  const [selectedMap, setSelectedMap] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const productsInSelectedMap = activeProducts.filter((product) => (product.mapId ?? product.gameMap) === selectedMap);
  const canSubmit = Boolean(selectedProduct);

  return (
    <form action={createCodeAction} className="utility-card space-y-4 animate-fade-in-up">
      <div>
        <h2 className="text-body-strong">เพิ่มรหัสใหม่</h2>
        <p className="text-caption mt-1 text-[var(--muted-foreground)]">
          เลือก Map ก่อน แล้วค่อยเลือกสินค้าที่ต้องการเติมรหัส
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-caption-strong">Map</span>
        <select
          value={selectedMap}
          onChange={(event) => {
            setSelectedMap(event.target.value);
            setSelectedProduct("");
          }}
          disabled={mapOptions.length === 0}
          className="input-apple"
        >
          <option value="">เลือก Map</option>
          {mapOptions.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-caption-strong">สินค้า</span>
        <select
          name="productId"
          required
          value={selectedProduct}
          onChange={(event) => setSelectedProduct(event.target.value)}
          disabled={!selectedMap || productsInSelectedMap.length === 0}
          className="input-apple"
        >
          <option value="">{selectedMap ? "เลือกสินค้า" : "เลือก Map ก่อน"}</option>
          {productsInSelectedMap.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.availableCodes} พร้อมขาย)
            </option>
          ))}
        </select>
        {selectedMap && productsInSelectedMap.length === 0 ? (
          <span className="text-fine-print text-[var(--muted-foreground)]">
            Map นี้ยังไม่มีสินค้าที่เปิดขาย
          </span>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-caption-strong">Game ID</span>
        <input name="gameAccountId" required spellCheck={false} className="input-apple" />
      </label>
      <label className="block space-y-2">
        <span className="text-caption-strong">Game Password</span>
        <input name="gamePassword" required spellCheck={false} className="input-apple" />
      </label>

      <button type="submit" className="btn-pill w-full" disabled={!canSubmit}>
        เพิ่มรหัส
      </button>
      {activeProducts.length === 0 ? (
        <p className="text-caption text-[var(--muted-foreground)]">เปิดขายสินค้าก่อนเพิ่มรหัสเข้า stock</p>
      ) : null}
    </form>
  );
}
