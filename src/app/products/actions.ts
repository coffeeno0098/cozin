"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { gameCodes, orders, pointTransactions, products, users } from "@/db/schema";
import { buildRateLimitKey, checkRateLimit, rateLimitWindows } from "@/lib/rate-limit";

type PurchaseResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "not-found" | "out-of-stock" | "not-enough-points" };

const buyProductSchema = z.object({
  productId: z.uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
});

async function purchaseProduct(userId: string, productId: string): Promise<PurchaseResult> {
  return db.transaction(async (tx) => {
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

export async function buyProductAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = buyProductSchema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    redirect("/products?error=invalid");
  }

  const rateLimitKey = await buildRateLimitKey("purchase", session.user.id);
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitWindows.purchase);

  if (!rateLimit.allowed) {
    redirect(`/products/${parsed.data.slug}?error=rate-limit`);
  }

  const result = await purchaseProduct(session.user.id, parsed.data.productId);

  if (!result.ok) {
    redirect(`/products/${parsed.data.slug}?error=${result.reason}`);
  }

  redirect(`/orders?success=1&order=${result.orderId}`);
}
