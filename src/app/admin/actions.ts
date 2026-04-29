"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { codeFormSchema, createSlug, deleteMapFormSchema, productFormSchema } from "@/lib/admin-validation";

function readForm(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function createUniqueSlug(name: string) {
  const baseSlug = createSlug(name) || "product";

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const [existingProduct] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);

    if (!existingProduct) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

async function createUniqueMapSlug(name: string) {
  const baseSlug = createSlug(name) || "map";

  for (let index = 0; index < 20; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const [existingMap] = await db.select({ id: gameMaps.id }).from(gameMaps).where(eq(gameMaps.slug, slug)).limit(1);

    if (!existingMap) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

async function resolveMap(input: { mapId?: string; newMapName?: string }) {
  if (input.newMapName) {
    const [existingMap] = await db
      .select({ id: gameMaps.id, name: gameMaps.name })
      .from(gameMaps)
      .where(eq(gameMaps.name, input.newMapName))
      .limit(1);

    if (existingMap) {
      return existingMap;
    }

    const [createdMap] = await db
      .insert(gameMaps)
      .values({
        name: input.newMapName,
        slug: await createUniqueMapSlug(input.newMapName),
      })
      .returning({
        id: gameMaps.id,
        name: gameMaps.name,
      });

    return createdMap;
  }

  if (!input.mapId) {
    return null;
  }

  const [selectedMap] = await db
    .select({ id: gameMaps.id, name: gameMaps.name })
    .from(gameMaps)
    .where(eq(gameMaps.id, input.mapId))
    .limit(1);

  return selectedMap ?? null;
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const slug = await createUniqueSlug(parsed.data.name);
  const selectedMap = await resolveMap({
    mapId: parsed.data.mapId,
    newMapName: parsed.data.newMapName,
  });

  if (!selectedMap) {
    redirect("/admin/products?error=map");
  }

  await db.insert(products).values({
    slug,
    name: parsed.data.name,
    mapId: selectedMap.id,
    gameMap: selectedMap.name,
    description: parsed.data.description,
    pricePoints: parsed.data.pricePoints,
    isActive: parsed.data.isActive,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?created=1");
}

export async function deleteMapAction(formData: FormData) {
  await requireAdmin();

  const parsed = deleteMapFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const [usage] = await db.select({ value: count() }).from(products).where(eq(products.mapId, parsed.data.mapId));

  if (usage.value > 0) {
    redirect("/admin/products?error=map-in-use");
  }

  await db.delete(gameMaps).where(eq(gameMaps.id, parsed.data.mapId));

  revalidatePath("/admin/products");
  redirect("/admin/products?mapDeleted=1");
}

export async function toggleProductAction(formData: FormData) {
  await requireAdmin();

  const productId = formData.get("productId");
  const nextState = formData.get("isActive");

  if (typeof productId !== "string" || typeof nextState !== "string") {
    redirect("/admin/products?error=invalid");
  }

  await db
    .update(products)
    .set({
      isActive: nextState === "true",
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?updated=1");
}

export async function createCodeAction(formData: FormData) {
  await requireAdmin();

  const parsed = codeFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/codes?error=invalid");
  }

  await db.insert(gameCodes).values({
    productId: parsed.data.productId,
    gameAccountId: parsed.data.gameAccountId,
    gamePassword: parsed.data.gamePassword,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/codes");
  revalidatePath("/admin/products");
  redirect("/admin/codes?created=1");
}
