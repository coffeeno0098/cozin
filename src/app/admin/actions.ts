"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { adminAuditLogs, gameCodes, gameMaps, pointTransactions, products, siteAnnouncements, users } from "@/db/schema";
import { sanitizeAuditMetadata, writeAdminAuditLog } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/admin";
import {
  codeFormSchema,
  announcementFormSchema,
  createSlug,
  deleteMapFormSchema,
  mapFormSchema,
  pointAdjustmentFormSchema,
  productFormSchema,
  toggleAnnouncementFormSchema,
  updateMapImageFormSchema,
  updateProductFormSchema,
} from "@/lib/admin-validation";

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

async function resolveMap(input: { mapId?: string; newMapName?: string; newMapImageUrl?: string | null }) {
  if (input.newMapName) {
    const [existingMap] = await db
      .select({ id: gameMaps.id, name: gameMaps.name, slug: gameMaps.slug })
      .from(gameMaps)
      .where(eq(gameMaps.name, input.newMapName))
      .limit(1);

    if (existingMap) {
      if (input.newMapImageUrl) {
        await db
          .update(gameMaps)
          .set({
            imageUrl: input.newMapImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(gameMaps.id, existingMap.id));
      }

      return existingMap;
    }

    const [createdMap] = await db
      .insert(gameMaps)
      .values({
        name: input.newMapName,
        slug: await createUniqueMapSlug(input.newMapName),
        imageUrl: input.newMapImageUrl ?? null,
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
    newMapImageUrl: parsed.data.newMapImageUrl,
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
      imageUrl: parsed.data.imageUrl ?? null,
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
      hasNewMapImage: Boolean(parsed.data.newMapImageUrl),
      hasImage: Boolean(parsed.data.imageUrl),
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

export async function createMapAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = mapFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid-map");
  }

  const [existingMap] = await db
    .select({ id: gameMaps.id })
    .from(gameMaps)
    .where(eq(gameMaps.name, parsed.data.name))
    .limit(1);

  if (existingMap) {
    redirect("/admin/products?error=duplicate-map");
  }

  const [createdMap] = await db
    .insert(gameMaps)
    .values({
      name: parsed.data.name,
      slug: await createUniqueMapSlug(parsed.data.name),
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning({
      id: gameMaps.id,
      name: gameMaps.name,
      slug: gameMaps.slug,
    });

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "map.create",
    targetType: "map",
    targetId: createdMap.id,
    metadata: {
      name: createdMap.name,
      slug: createdMap.slug,
      hasImage: Boolean(parsed.data.imageUrl),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products?mapCreated=1");
}

export async function updateMapImageAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = updateMapImageFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid-map-image");
  }

  const [selectedMap] = await db
    .select({
      id: gameMaps.id,
      name: gameMaps.name,
      slug: gameMaps.slug,
      imageUrl: gameMaps.imageUrl,
    })
    .from(gameMaps)
    .where(eq(gameMaps.id, parsed.data.mapId))
    .limit(1);

  if (!selectedMap) {
    redirect("/admin/products?error=map");
  }

  await db
    .update(gameMaps)
    .set({
      imageUrl: parsed.data.imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(gameMaps.id, parsed.data.mapId));

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "map.image.update",
    targetType: "map",
    targetId: selectedMap.id,
    metadata: {
      name: selectedMap.name,
      slug: selectedMap.slug,
      hadImage: Boolean(selectedMap.imageUrl),
      hasImage: Boolean(parsed.data.imageUrl),
    },
  });

  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/maps/${selectedMap.slug}`);
  redirect("/admin/products?mapUpdated=1");
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

export async function updateProductAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = updateProductFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/products?error=invalid-product");
  }

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      imageUrl: products.imageUrl,
      pricePoints: products.pricePoints,
      isActive: products.isActive,
    })
    .from(products)
    .where(eq(products.id, parsed.data.productId))
    .limit(1);

  if (!product) {
    redirect("/admin/products?error=product-not-found");
  }

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl ?? null,
      pricePoints: parsed.data.pricePoints,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(products.id, parsed.data.productId));

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "product.update",
    targetType: "product",
    targetId: product.id,
    metadata: sanitizeAuditMetadata({
      slug: product.slug,
      previousName: product.name,
      nextName: parsed.data.name,
      previousPricePoints: product.pricePoints,
      nextPricePoints: parsed.data.pricePoints,
      hadImage: Boolean(product.imageUrl),
      hasImage: Boolean(parsed.data.imageUrl),
      previousIsActive: product.isActive,
      nextIsActive: parsed.data.isActive,
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
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

export async function adjustUserPointsAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = pointAdjustmentFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/users?error=invalid");
  }

  const result = await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select({
        id: users.id,
        username: users.username,
        points: users.points,
      })
      .from(users)
      .where(eq(users.id, parsed.data.userId))
      .for("update")
      .limit(1);

    if (!targetUser) {
      return { ok: false as const, reason: "not-found" };
    }

    const balanceAfter = targetUser.points + parsed.data.pointsDelta;

    if (balanceAfter < 0) {
      return { ok: false as const, reason: "negative" };
    }

    await tx
      .update(users)
      .set({
        points: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUser.id));

    const [transaction] = await tx
      .insert(pointTransactions)
      .values({
        userId: targetUser.id,
        type: "adjustment",
        points: parsed.data.pointsDelta,
        balanceAfter,
        note: parsed.data.reason,
      })
      .returning({
        id: pointTransactions.id,
      });

    await tx.insert(adminAuditLogs).values({
      adminUserId: currentUser.id,
      action: "points.adjust",
      targetType: "user",
      targetId: targetUser.id,
      metadata: sanitizeAuditMetadata({
        username: targetUser.username,
        pointsDelta: parsed.data.pointsDelta,
        balanceBefore: targetUser.points,
        balanceAfter,
        reason: parsed.data.reason,
        pointTransactionId: transaction.id,
      }),
    });

    return { ok: true as const };
  });

  if (!result.ok) {
    redirect(`/admin/users?error=${result.reason}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/admin/users");
  redirect("/admin/users?adjusted=1");
}

export async function createAnnouncementAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = announcementFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/announcements?error=invalid");
  }

  const [announcement] = await db
    .insert(siteAnnouncements)
    .values({
      message: parsed.data.message,
      isActive: parsed.data.isActive,
      createdByUserId: currentUser.id,
    })
    .returning({
      id: siteAnnouncements.id,
      message: siteAnnouncements.message,
      isActive: siteAnnouncements.isActive,
    });

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "announcement.create",
    targetType: "site_announcement",
    targetId: announcement.id,
    metadata: {
      message: announcement.message,
      isActive: announcement.isActive,
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/topup");
  redirect("/admin/announcements?created=1");
}

export async function toggleAnnouncementAction(formData: FormData) {
  const currentUser = await requireAdmin();

  const parsed = toggleAnnouncementFormSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    redirect("/admin/announcements?error=invalid");
  }

  const [announcement] = await db
    .select({
      id: siteAnnouncements.id,
      message: siteAnnouncements.message,
      isActive: siteAnnouncements.isActive,
    })
    .from(siteAnnouncements)
    .where(eq(siteAnnouncements.id, parsed.data.announcementId))
    .limit(1);

  if (!announcement) {
    redirect("/admin/announcements?error=not-found");
  }

  await db
    .update(siteAnnouncements)
    .set({
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(siteAnnouncements.id, announcement.id));

  await writeAdminAuditLog({
    adminUserId: currentUser.id,
    action: "announcement.toggle",
    targetType: "site_announcement",
    targetId: announcement.id,
    metadata: {
      message: announcement.message,
      previousIsActive: announcement.isActive,
      nextIsActive: parsed.data.isActive,
    },
  });

  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/audit-logs");
  revalidatePath("/orders");
  revalidatePath("/products");
  revalidatePath("/topup");
  redirect("/admin/announcements?updated=1");
}
