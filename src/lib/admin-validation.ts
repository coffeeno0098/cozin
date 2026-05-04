import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mapId: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  newMapName: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1).max(120).optional(),
  ),
  newMapImageUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().url().max(2000).nullable().optional(),
  ),
  description: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(1000).nullable(),
  ),
  imageUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().url().max(2000).nullable().optional(),
  ),
  pricePoints: z.coerce.number().int().min(1).max(1_000_000),
  isActive: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
}).refine((data) => data.mapId || data.newMapName, {
  message: "Select an existing map or create a new one.",
  path: ["mapId"],
});

export const updateProductFormSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(1000).nullable(),
  ),
  imageUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().url().max(2000).nullable().optional(),
  ),
  pricePoints: z.coerce.number().int().min(1).max(1_000_000),
  isActive: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

export const deleteMapFormSchema = z.object({
  mapId: z.string().uuid(),
});

export const mapFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  imageUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().url().max(2000).nullable().optional(),
  ),
});

export const updateMapImageFormSchema = z.object({
  mapId: z.string().uuid(),
  imageUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().url().max(2000).nullable(),
  ),
});

export const codeFormSchema = z.object({
  productId: z.string().uuid(),
  gameAccountId: z.string().trim().min(1).max(255),
  gamePassword: z.string().trim().min(1).max(255),
});

export const updateCodeFormSchema = z.object({
  codeId: z.string().uuid(),
  gameAccountId: z.string().trim().min(1).max(255),
  gamePassword: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1).max(255).optional(),
  ),
});

export const pointAdjustmentFormSchema = z.object({
  userId: z.string().uuid(),
  pointsDelta: z.coerce.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0, {
    message: "Adjustment amount cannot be zero.",
  }),
  reason: z.string().trim().min(3).max(500),
});

export const announcementFormSchema = z.object({
  message: z.string().trim().min(3).max(500),
  isActive: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
});

export const toggleAnnouncementFormSchema = z.object({
  announcementId: z.string().uuid(),
  isActive: z.preprocess((value) => value === "true", z.boolean()),
});

export function createSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
