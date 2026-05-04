import { asc, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";

export async function getAdminProductRows() {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      mapId: products.mapId,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      description: products.description,
      imageUrl: products.imageUrl,
      pricePoints: products.pricePoints,
      isActive: products.isActive,
      availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      soldCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reservedCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
      totalCodes: count(gameCodes.id),
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.createdAt));
}

export async function getAdminMapRows() {
  return db
    .select({
      id: gameMaps.id,
      name: gameMaps.name,
      imageUrl: gameMaps.imageUrl,
      productCount: count(products.id),
    })
    .from(gameMaps)
    .leftJoin(products, eq(products.mapId, gameMaps.id))
    .groupBy(gameMaps.id)
    .orderBy(asc(gameMaps.name));
}

export type AdminProductRow = Awaited<ReturnType<typeof getAdminProductRows>>[number];
export type AdminMapRow = Awaited<ReturnType<typeof getAdminMapRows>>[number];
