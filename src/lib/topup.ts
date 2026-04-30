import { eq } from "drizzle-orm";

import { db } from "@/db";
import { payments, pointTransactions, users } from "@/db/schema";

type TopupDb = Pick<typeof db, "transaction">;

export type ApplyVerifiedTopupResult = {
  balanceAfter: number;
  pointsGranted: number;
};

export async function applyVerifiedTopup(
  userId: string,
  paymentId: string,
  amountBaht: number,
  rawResponse: unknown,
  database: TopupDb = db,
): Promise<ApplyVerifiedTopupResult> {
  if (!Number.isInteger(amountBaht) || amountBaht <= 0) {
    throw new Error("Top-up amount must be a positive integer");
  }

  return database.transaction(async (tx) => {
    const [user] = await tx
      .select({
        id: users.id,
        points: users.points,
      })
      .from(users)
      .where(eq(users.id, userId))
      .for("update")
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const pointsGranted = amountBaht;
    const balanceAfter = user.points + pointsGranted;

    await tx
      .update(users)
      .set({
        points: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await tx
      .update(payments)
      .set({
        amountBaht,
        pointsGranted,
        status: "verified",
        verifiedAt: new Date(),
        rawResponse,
      })
      .where(eq(payments.id, paymentId));

    await tx.insert(pointTransactions).values({
      userId: user.id,
      type: "topup",
      points: pointsGranted,
      balanceAfter,
      paymentId,
      note: "TrueMoney gift top-up",
    });

    return {
      balanceAfter,
      pointsGranted,
    };
  });
}
