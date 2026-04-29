import { asc, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";

export async function getPublicProducts(limit?: number) {
  const query = db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      gameMap: sql<string>`coalesce(${gameMaps.name}, ${products.gameMap})`,
      description: products.description,
      pricePoints: products.pricePoints,
      availableCodes: count(gameCodes.id),
    })
    .from(products)
    .leftJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, sql`${gameCodes.productId} = ${products.id} and ${gameCodes.status} = 'available'`)
    .where(eq(products.isActive, true))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.createdAt));

  if (limit) {
    return query.limit(limit);
  }

  return query;
}
