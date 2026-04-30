import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, orders, pointTransactions, products, users } from "@/db/schema";

export type PurchaseResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not-found" | "out-of-stock" | "not-enough-points" };

type PurchaseDb = Pick<typeof db, "transaction">;

export async function purchaseProduct(
  userId: string,
  productId: string,
  database: PurchaseDb = db,
): Promise<PurchaseResult> {
  return database.transaction(async (tx) => {
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

    if (user.points < product.pricePoints) {
      return { ok: false, reason: "not-enough-points" };
    }

    const [code] = await tx
      .select({
        id: gameCodes.id,
      })
      .from(gameCodes)
      .where(sql`${gameCodes.productId} = ${product.id} and ${gameCodes.status} = 'available'`)
      .orderBy(gameCodes.createdAt)
      .for("update", { skipLocked: true })
      .limit(1);

    if (!code) {
      return { ok: false, reason: "out-of-stock" };
    }

    const balanceAfter = user.points - product.pricePoints;

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
      .where(eq(gameCodes.id, code.id));

    const [order] = await tx
      .insert(orders)
      .values({
        userId: user.id,
        productId: product.id,
        gameCodeId: code.id,
        pricePoints: product.pricePoints,
        status: "fulfilled",
      })
      .returning({ id: orders.id });

    await tx.insert(pointTransactions).values({
      userId: user.id,
      type: "purchase",
      points: -product.pricePoints,
      balanceAfter,
      orderId: order.id,
      note: "Product purchase",
    });

    return { ok: true, orderId: order.id };
  });
}
