import { and, asc, count, eq, sql } from "drizzle-orm";

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
      imageUrl: products.imageUrl,
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

export async function getPublicMaps() {
  return db
    .select({
      id: gameMaps.id,
      slug: gameMaps.slug,
      name: gameMaps.name,
      imageUrl: gameMaps.imageUrl,
      productCount: sql<number>`count(distinct ${products.id})::int`,
      availableCodes: sql<number>`coalesce(count(${gameCodes.id}) filter (where ${gameCodes.status} = 'available'), 0)::int`,
    })
    .from(gameMaps)
    .innerJoin(products, and(eq(products.mapId, gameMaps.id), eq(products.isActive, true)))
    .leftJoin(gameCodes, eq(gameCodes.productId, products.id))
    .groupBy(gameMaps.id)
    .orderBy(asc(gameMaps.name));
}

export async function getPublicMapWithProducts(slug: string) {
  const [map] = await db
    .select({
      id: gameMaps.id,
      slug: gameMaps.slug,
      name: gameMaps.name,
      imageUrl: gameMaps.imageUrl,
    })
    .from(gameMaps)
    .where(eq(gameMaps.slug, slug))
    .limit(1);

  if (!map) {
    return null;
  }

  const productRows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      gameMap: gameMaps.name,
      description: products.description,
      imageUrl: products.imageUrl,
      pricePoints: products.pricePoints,
      availableCodes: count(gameCodes.id),
    })
    .from(products)
    .innerJoin(gameMaps, eq(products.mapId, gameMaps.id))
    .leftJoin(gameCodes, sql`${gameCodes.productId} = ${products.id} and ${gameCodes.status} = 'available'`)
    .where(and(eq(gameMaps.slug, slug), eq(products.isActive, true)))
    .groupBy(products.id, gameMaps.id)
    .orderBy(asc(products.createdAt));

  return {
    map,
    products: productRows,
  };
}
