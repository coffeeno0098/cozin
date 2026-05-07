import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, orders, pointTransactions, products, users } from "@/db/schema";

export type PurchaseResult =
  | { ok: true; orderId: string; orderIds: string[] }
  | { ok: false; reason: "not-found" | "out-of-stock" | "not-enough-points" };

type PurchaseDb = Pick<typeof db, "transaction">;

export async function purchaseProduct(
  userId: string,
  productId: string,
  quantityOrDatabase: number | PurchaseDb = 1,
  database?: PurchaseDb,
): Promise<PurchaseResult> {
  const quantity = typeof quantityOrDatabase === "number" ? quantityOrDatabase : 1;
  const purchaseDb = typeof quantityOrDatabase === "number" ? (database ?? db) : quantityOrDatabase;

  return purchaseDb.transaction(async (tx) => {
    const [user] = await tx
      .select({
        id: users.id,
        points: users.points,
      })
      .from(users)
      .where(eq(users.id, userId))
      .for("update")
      .limit(1);

    const [product] = await tx
      .select({
        id: products.id,
        pricePoints: products.pricePoints,
        isActive: products.isActive,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!user || !product || !product.isActive) {
      return { ok: false, reason: "not-found" };
    }

    const purchaseQuantity = Math.min(20, Math.max(1, Math.floor(quantity)));
    const totalPricePoints = product.pricePoints * purchaseQuantity;

    if (user.points < totalPricePoints) {
      return { ok: false, reason: "not-enough-points" };
    }

    const codes = await tx
      .select({
        id: gameCodes.id,
      })
      .from(gameCodes)
      .where(sql`${gameCodes.productId} = ${product.id} and ${gameCodes.status} = 'available'`)
      .orderBy(gameCodes.createdAt)
      .for("update", { skipLocked: true })
      .limit(purchaseQuantity);

    if (codes.length < purchaseQuantity) {
      return { ok: false, reason: "out-of-stock" };
    }

    const balanceAfter = user.points - totalPricePoints;

    await tx
      .update(users)
      .set({
        points: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await tx
      .update(gameCodes)
      .set({
        status: "sold",
        soldToUserId: user.id,
        soldAt: new Date(),
      })
      .where(inArray(gameCodes.id, codes.map((code) => code.id)));

    const createdOrders = await tx
      .insert(orders)
      .values(codes.map((code) => ({
        userId: user.id,
        productId: product.id,
        gameCodeId: code.id,
        pricePoints: product.pricePoints,
        status: "fulfilled" as const,
      })))
      .returning({ id: orders.id });

    const [firstOrder] = createdOrders;

    if (!firstOrder) {
      return { ok: false, reason: "out-of-stock" };
    }

    await tx.insert(pointTransactions).values({
      userId: user.id,
      type: "purchase",
      points: -totalPricePoints,
      balanceAfter,
      orderId: firstOrder.id,
      note: purchaseQuantity === 1 ? "Product purchase" : `Product purchase x${purchaseQuantity}`,
    });

    return {
      ok: true,
      orderId: firstOrder.id,
      orderIds: createdOrders.map((order) => order.id),
    };
  });
}
