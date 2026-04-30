import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, gameMaps, orders, payments, products, users } from "@/db/schema";

export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "out" | "low" | "healthy";

export function getStockStatus(availableCodes: number, threshold = LOW_STOCK_THRESHOLD): StockStatus {
  if (availableCodes <= 0) {
    return "out";
  }

  if (availableCodes <= threshold) {
    return "low";
  }

  return "healthy";
}

export async function getAdminDashboardData() {
  const [
    [salesSummary],
    [paymentSummary],
    [productSummary],
    [stockSummary],
    latestOrders,
    latestPayments,
    lowStockProducts,
  ] = await Promise.all([
    db
      .select({
        totalSalesPoints: sql<number>`coalesce(sum(${orders.pricePoints}), 0)::int`,
        orderCount: count(orders.id),
      })
      .from(orders),
    db
      .select({
        verifiedTopupPoints: sql<number>`coalesce(sum(${payments.pointsGranted}) filter (where ${payments.status} = 'verified'), 0)::int`,
        verifiedTopupBaht: sql<number>`coalesce(sum(${payments.amountBaht}) filter (where ${payments.status} = 'verified'), 0)::int`,
        pendingPaymentCount: sql<number>`coalesce(count(${payments.id}) filter (where ${payments.status} = 'pending'), 0)::int`,
        rejectedPaymentCount: sql<number>`coalesce(count(${payments.id}) filter (where ${payments.status} = 'rejected'), 0)::int`,
      })
      .from(payments),
    db
      .select({
        activeProductCount: sql<number>`coalesce(count(${products.id}) filter (where ${products.isActive} = true), 0)::int`,
        totalProductCount: count(products.id),
      })
      .from(products),
    db
      .select({
        availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
        soldCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
        reservedCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
      })
      .from(gameCodes),
    db
      .select({
        id: orders.id,
        pricePoints: orders.pricePoints,
        status: orders.status,
        createdAt: orders.createdAt,
        username: users.username,
        productName: products.name,
        gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(products, eq(orders.productId, products.id))
      .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
      .orderBy(desc(orders.createdAt))
      .limit(5),
    db
      .select({
        id: payments.id,
        username: users.username,
        status: payments.status,
        amountBaht: payments.amountBaht,
        pointsGranted: payments.pointsGranted,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt))
      .limit(5),
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
        availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      })
      .from(products)
      .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
      .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
      .where(eq(products.isActive, true))
      .groupBy(products.id, gameMaps.name)
      .having(sql`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0) <= ${LOW_STOCK_THRESHOLD}`)
      .orderBy(sql`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0) asc`, products.name)
      .limit(8),
  ]);

  return {
    salesSummary,
    paymentSummary,
    productSummary,
    stockSummary,
    latestOrders,
    latestPayments,
    lowStockProducts: lowStockProducts.map((product) => ({
      ...product,
      stockStatus: getStockStatus(product.availableCodes),
    })),
  };
}
