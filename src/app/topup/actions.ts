"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { env } from "@/lib/env";
import { buildRateLimitKey, checkRateLimit, rateLimitWindows } from "@/lib/rate-limit";
import { applyVerifiedTopup } from "@/lib/topup";
import { decideExistingTopupPayment } from "@/lib/topup-safety";
import { extractTrueMoneyVoucherCode, redeemTrueMoneyVoucher } from "@/lib/truemoney";

const topupSchema = z.object({
  voucherUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .refine((value) => extractTrueMoneyVoucherCode(value) !== null, "Expected a TrueMoney gift link."),
});

export async function createTopupAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rateLimitKey = await buildRateLimitKey("topup", session.user.id);
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitWindows.topup);

  if (!rateLimit.allowed) {
    redirect("/topup?error=rate-limit");
  }

  const parsed = topupSchema.safeParse({
    voucherUrl: formData.get("voucherUrl"),
  });

  if (!parsed.success) {
    redirect("/topup?error=invalid");
  }

  const voucherCode = extractTrueMoneyVoucherCode(parsed.data.voucherUrl);

  if (!voucherCode) {
    redirect("/topup?error=invalid");
  }

  if (!env.TRUEMONEY_RECEIVER_PHONE) {
    redirect("/topup?error=config");
  }

  const [existingPayment] = await db
    .select({
      id: payments.id,
      userId: payments.userId,
      status: payments.status,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.externalReference, voucherCode))
    .limit(1);

  const existingPaymentDecision = decideExistingTopupPayment(existingPayment, session.user.id);

  if (existingPaymentDecision.action === "reject") {
    redirect(`/topup?error=${existingPaymentDecision.error}`);
  }

  const payment = existingPaymentDecision.action === "retry" && existingPayment
    ? await db.transaction(async (tx) => {
        await tx
          .update(payments)
          .set({
            truemoneyVoucherUrl: parsed.data.voucherUrl,
            amountBaht: 0,
            pointsGranted: 0,
            status: "pending",
            rawResponse: {
              note: "Retrying TrueMoney verification",
            },
            verifiedAt: null,
          })
          .where(eq(payments.id, existingPayment.id));

        return { id: existingPayment.id };
      })
    : (
        await db
          .insert(payments)
          .values({
            userId: session.user.id,
            truemoneyVoucherUrl: parsed.data.voucherUrl,
            externalReference: voucherCode,
            amountBaht: 0,
            pointsGranted: 0,
            status: "pending",
            rawResponse: {
              note: "Waiting for TrueMoney verification",
            },
          })
          .onConflictDoNothing()
          .returning({ id: payments.id })
      )[0];

  if (!payment) {
    redirect("/topup?error=processing");
  }

  const redeemResult = await redeemTrueMoneyVoucher(voucherCode, env.TRUEMONEY_RECEIVER_PHONE);

  if (!redeemResult.ok) {
    await db
      .update(payments)
      .set({
        status: "rejected",
        rawResponse: {
          code: redeemResult.code,
          message: redeemResult.message,
          statusCode: redeemResult.statusCode,
          payload: redeemResult.payload,
        },
      })
      .where(eq(payments.id, payment.id));

    revalidatePath("/topup");
    redirect(`/topup?error=redeem&reason=${encodeURIComponent(redeemResult.message)}`);
  }

  await applyVerifiedTopup(session.user.id, payment.id, redeemResult.amountBaht, {
    statusCode: redeemResult.statusCode,
    payload: redeemResult.payload,
  });

  revalidatePath("/topup");
  revalidatePath("/account");
  redirect(`/topup?success=1&amount=${redeemResult.amountBaht}`);
}
