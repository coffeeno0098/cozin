import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";

export async function getAdminCodeProductRows() {
  return db
    .select({
      id: products.id,
      mapId: products.mapId,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      isActive: products.isActive,
      availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
      soldCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'sold'), 0)::int`,
      reservedCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'reserved'), 0)::int`,
      totalCodes: sql<number>`coalesce(count(${gameCodes.id}), 0)::int`,
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.name));
}

export async function getAdminCodeRows() {
  return db
    .select({
      id: gameCodes.id,
      productId: gameCodes.productId,
      gameAccountId: gameCodes.gameAccountId,
      status: gameCodes.status,
      createdAt: gameCodes.createdAt,
      productName: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
    })
    .from(gameCodes)
    .innerJoin(products, eq(gameCodes.productId, products.id))
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .orderBy(desc(gameCodes.createdAt));
}

export type AdminCodeProductRow = Awaited<ReturnType<typeof getAdminCodeProductRows>>[number];
export type AdminCodeRow = Awaited<ReturnType<typeof getAdminCodeRows>>[number];
