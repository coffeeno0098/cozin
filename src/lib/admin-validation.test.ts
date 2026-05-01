import { describe, expect, it } from "vitest";

import {
  announcementFormSchema,
  pointAdjustmentFormSchema,
  productFormSchema,
  toggleAnnouncementFormSchema,
  updateMapImageFormSchema,
} from "@/lib/admin-validation";

describe("productFormSchema", () => {
  const baseProduct = {
    name: "Captain",
    newMapName: "Blox Fruit",
    description: "",
    pricePoints: "10",
    isActive: "on",
  };

  it("accepts an optional product image URL", () => {
    const parsed = productFormSchema.safeParse({
      ...baseProduct,
      imageUrl: "https://example.com/product.png",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.imageUrl).toBe("https://example.com/product.png");
    }
  });

  it("normalizes an empty product image URL to null", () => {
    const parsed = productFormSchema.safeParse({
      ...baseProduct,
      imageUrl: "",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.imageUrl).toBeNull();
    }
  });

  it("allows product image URL to be omitted", () => {
    expect(productFormSchema.safeParse(baseProduct).success).toBe(true);
  });

  it("rejects invalid product image URLs", () => {
    expect(
      productFormSchema.safeParse({
        ...baseProduct,
        imageUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("accepts an optional new map image URL", () => {
    const parsed = productFormSchema.safeParse({
      ...baseProduct,
      newMapImageUrl: "https://example.com/map.png",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.newMapImageUrl).toBe("https://example.com/map.png");
    }
  });
});

describe("updateMapImageFormSchema", () => {
  it("accepts valid map image URLs", () => {
    expect(
      updateMapImageFormSchema.safeParse({
        mapId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        imageUrl: "https://example.com/map.png",
      }).success,
    ).toBe(true);
  });

  it("normalizes an empty map image URL to null", () => {
    const parsed = updateMapImageFormSchema.safeParse({
      mapId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
      imageUrl: "",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.imageUrl).toBeNull();
    }
  });

  it("rejects invalid map image URLs", () => {
    expect(
      updateMapImageFormSchema.safeParse({
        mapId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        imageUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });
});

describe("pointAdjustmentFormSchema", () => {
  it("accepts positive and negative non-zero point adjustments with a reason", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "10",
        reason: "Customer support adjustment",
      }).success,
    ).toBe(true);

    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "-5",
        reason: "Correction",
      }).success,
    ).toBe(true);
  });

  it("rejects zero point adjustments", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "0",
        reason: "No change",
      }).success,
    ).toBe(false);
  });

  it("requires a valid user id and reason", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "not-a-uuid",
        pointsDelta: "10",
        reason: "ok",
      }).success,
    ).toBe(false);
  });
});

describe("announcement validation", () => {
  it("accepts announcement messages and checkbox state", () => {
    expect(
      announcementFormSchema.safeParse({
        message: "เว็บจะปิดปรับปรุงภายในเวลา 12.00 น.",
        isActive: "on",
      }).success,
    ).toBe(true);
  });

  it("rejects very short announcements", () => {
    expect(
      announcementFormSchema.safeParse({
        message: "x",
        isActive: "on",
      }).success,
    ).toBe(false);
  });

  it("validates announcement toggle input", () => {
    expect(
      toggleAnnouncementFormSchema.safeParse({
        announcementId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        isActive: "true",
      }).success,
    ).toBe(true);
  });
});
