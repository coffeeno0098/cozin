"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";

import { buyProductAction } from "@/app/products/actions";

type QuantityPurchaseFormProps = {
  productId: string;
  slug: string;
  pricePoints: number;
  userPoints: number;
  availableCodes: number;
};

export function QuantityPurchaseForm({
  productId,
  slug,
  pricePoints,
  userPoints,
  availableCodes,
}: QuantityPurchaseFormProps) {
  const maxQuantity = Math.max(1, Math.min(availableCodes, 20));
  const [quantity, setQuantity] = useState(1);
  const totalPoints = useMemo(() => pricePoints * quantity, [pricePoints, quantity]);
  const hasEnoughPoints = userPoints >= totalPoints;
  const isInStock = availableCodes > 0;
  const canBuy = isInStock && hasEnoughPoints;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(maxQuantity, current + 1));
  }

  return (
    <form action={buyProductAction} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-caption-strong text-white">จำนวนรหัส</p>
            <p className="text-caption mt-1 text-white/50">เลือกจำนวนที่ต้องการซื้อ</p>
          </div>
          <p className="text-caption text-white/55">
            คงเหลือ <span className="font-semibold text-white">{availableCodes}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="inline-flex h-12 items-center overflow-hidden rounded-xl border border-white/12 bg-black">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              className="grid h-full w-12 place-items-center text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/25"
              aria-label="ลดจำนวนรหัส"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <span className="grid h-full min-w-14 place-items-center px-4 text-body-strong tabular-nums text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity >= maxQuantity || !isInStock}
              className="grid h-full w-12 place-items-center bg-white/8 text-white transition-colors hover:bg-white/14 disabled:cursor-not-allowed disabled:text-white/25"
              aria-label="เพิ่มจำนวนรหัส"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-caption text-white/50">รวมทั้งหมด</p>
            <p className="text-body-strong tabular-nums text-white">{totalPoints} Point</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canBuy}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-caption-strong transition disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
        style={
          canBuy
            ? {
                background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
                color: "white",
                boxShadow: "0 8px 28px rgba(129,140,248,0.3)",
              }
            : undefined
        }
      >
        {canBuy ? <ShoppingBag size={18} aria-hidden="true" /> : null}
        {!isInStock ? "สินค้าหมด" : hasEnoughPoints ? "ซื้อเลย" : "Point ไม่พอ"}
      </button>
    </form>
  );
}
