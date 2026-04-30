"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { gameCodes, gameMaps, products } from "@/db/schema";
import { writeAdminAuditLog } from "@/lib/admin-audit";
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

function maskIdentifier(value: string) {
  if (value.length <= 4) {
    return "*".repeat(value.length);
  }

  return `${"*".repeat(Math.max(value.length - 4, 0))}${value.slice(-4)}`;
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
  const currentUser = await requireAdmin();

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

  const [createdProduct] = await db
    .insert(products)
    .values({
      slug,
      name: parsed.data.name,
      mapId: selectedMap.id,
      gameMap: selectedMap.name,
      description: parsed.data.description,
      pricePoints: parsed.data.pricePoints,
      isActive: parsed.data.isActive,
    })
    .returning({
      id: products.id,
      slug: products.slug,
      name: products.name,
    });

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "product.create",
    targetType: "product",
    targetId: createdProduct.id,
    metadata: {
      name: createdProduct.name,
      slug: createdProduct.slug,
      mapId: selectedMap.id,
      mapName: selectedMap.name,
      pricePoints: parsed.data.pricePoints,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?created=1");
}

export async function deleteMapAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = deleteMapFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid");
  }

  const [usage] = await db.select({ value: count() }).from(products).where(eq(products.mapId, parsed.data.mapId));

  if (usage.value > 0) {
    redirect("/admin/products?error=map-in-use");
  }

  const [selectedMap] = await db
    .select({
      id: gameMaps.id,
      name: gameMaps.name,
      slug: gameMaps.slug,
    })
    .from(gameMaps)
    .where(eq(gameMaps.id, parsed.data.mapId))
    .limit(1);

  await db.delete(gameMaps).where(eq(gameMaps.id, parsed.data.mapId));

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "map.delete",
    targetType: "map",
    targetId: parsed.data.mapId,
    metadata: {
      name: selectedMap?.name,
      slug: selectedMap?.slug,
    },
  });

  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  redirect("/admin/products?mapDeleted=1");
}

export async function toggleProductAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const productId = formData.get("productId");
  const nextState = formData.get("isActive");

  if (typeof productId !== "string" || typeof nextState !== "string") {
    redirect("/admin/products?error=invalid");
  }

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      isActive: products.isActive,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  await db
    .update(products)
    .set({
      isActive: nextState === "true",
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "product.toggle",
    targetType: "product",
    targetId: productId,
    metadata: {
      name: product?.name,
      slug: product?.slug,
      previousIsActive: product?.isActive,
      nextIsActive: nextState === "true",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?updated=1");
}

export async function createCodeAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = codeFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/codes?error=invalid");
  }

  const [createdCode] = await db
    .insert(gameCodes)
    .values({
      productId: parsed.data.productId,
      gameAccountId: parsed.data.gameAccountId,
      gamePassword: parsed.data.gamePassword,
    })
    .returning({
      id: gameCodes.id,
      productId: gameCodes.productId,
      gameAccountId: gameCodes.gameAccountId,
    });

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "code.create",
    targetType: "game_code",
    targetId: createdCode.id,
    metadata: {
      productId: createdCode.productId,
      gameAccountIdMasked: maskIdentifier(createdCode.gameAccountId),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/codes");
  revalidatePath("/admin/products");
  redirect("/admin/codes?created=1");
}
