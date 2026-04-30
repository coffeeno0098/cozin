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
  description: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(1000).nullable(),
  ),
  pricePoints: z.coerce.number().int().min(1).max(1_000_000),
  isActive: z.preprocess((value) => value === "on" || value === "true", z.boolean()),
}).refine((data) => data.mapId || data.newMapName, {
  message: "Select an existing map or create a new one.",
  path: ["mapId"],
});

export const deleteMapFormSchema = z.object({
  mapId: z.string().uuid(),
});

export const codeFormSchema = z.object({
  productId: z.string().uuid(),
  gameAccountId: z.string().trim().min(1).max(255),
  gamePassword: z.string().trim().min(1).max(255),
});

export const pointAdjustmentFormSchema = z.object({
  userId: z.string().uuid(),
  pointsDelta: z.coerce.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0, {
    message: "Adjustment amount cannot be zero.",
  }),
  reason: z.string().trim().min(3).max(500),
});

export function createSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
