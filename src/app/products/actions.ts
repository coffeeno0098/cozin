"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { purchaseProduct } from "@/lib/purchase";
import { buildRateLimitKey, checkRateLimit, rateLimitWindows } from "@/lib/rate-limit";

const buyProductSchema = z.object({
  productId: z.uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
});

export async function buyProductAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = buyProductSchema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    redirect("/products?error=invalid");
  }

  const rateLimitKey = await buildRateLimitKey("purchase", session.user.id);
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitWindows.purchase);

  if (!rateLimit.allowed) {
    redirect(`/products/${parsed.data.slug}?error=rate-limit`);
  }

  const result = await purchaseProduct(session.user.id, parsed.data.productId);

  if (!result.ok) {
    redirect(`/products/${parsed.data.slug}?error=${result.reason}`);
  }

  redirect(`/orders?success=1&order=${result.orderId}`);
}
