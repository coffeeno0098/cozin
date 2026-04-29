import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createTopupAction } from "@/app/topup/actions";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { payments } from "@/db/schema";

type TopupPageProps = {
  searchParams?: Promise<{
    amount?: string;
    error?: string;
    reason?: string;
    success?: string;
  }>;
};

function getTopupErrorMessage(error?: string, reason?: string) {
  if (error === "invalid") return "Please enter a valid TrueMoney gift link.";
  if (error === "config") return "Top-up is not ready yet. Please set TRUEMONEY_RECEIVER_PHONE first.";
  if (error === "duplicate") return "This TrueMoney gift link has already been used.";
  if (error === "processing") return "This TrueMoney gift link is already being processed.";
  if (error === "redeem") return reason || "TrueMoney could not verify this gift link.";
  return "Top-up failed. Please check the gift link and try again.";
}

export const dynamic = "force-dynamic";

export default async function TopupPage({ searchParams }: TopupPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const paymentRows = await db
    .select({
      id: payments.id,
      status: payments.status,
      amountBaht: payments.amountBaht,
      pointsGranted: payments.pointsGranted,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.userId, session.user.id))
    .orderBy(desc(payments.createdAt))
    .limit(10);

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin account</p>
            <h1 className="text-2xl font-semibold">Top up Point</h1>
            <p className="mt-1 text-sm text-muted-foreground">Submit a TrueMoney gift link for verification.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/account">Back to account</Link>
          </Button>
        </div>

        {params?.success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Top-up completed. {params.amount ?? "0"} Point has been added to your account.
          </div>
        ) : null}
        {params?.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {getTopupErrorMessage(params.error, params.reason)}
          </div>
        ) : null}

        <form action={createTopupAction} className="space-y-4 rounded-lg border p-5">
          <div>
            <h2 className="font-semibold">TrueMoney gift link</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The system verifies the gift link and converts 1 baht to 1 Point automatically.
            </p>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Gift link</span>
            <input
              name="voucherUrl"
              type="url"
              required
              placeholder="https://gift.truemoney.com/campaign/?v=..."
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <Button type="submit">Top up now</Button>
        </form>

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">Recent top-ups</h2>
          {paymentRows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No top-up requests yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {paymentRows.map((payment) => (
                <div key={payment.id} className="flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{payment.status}</p>
                    <p className="text-xs text-muted-foreground">{payment.createdAt.toLocaleString("th-TH")}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.amountBaht} THB / {payment.pointsGranted} Point
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
