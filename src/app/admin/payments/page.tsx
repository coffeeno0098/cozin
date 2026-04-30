import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type RawPaymentResponse = {
  code?: unknown;
  message?: unknown;
};

function formatReference(reference: string | null) {
  if (!reference) return "No reference";
  if (reference.length <= 12) return reference;

  return `${reference.slice(0, 6)}...${reference.slice(-4)}`;
}

function getPaymentError(rawResponse: unknown) {
  if (!rawResponse || typeof rawResponse !== "object") {
    return null;
  }

  const response = rawResponse as RawPaymentResponse;
  const code = typeof response.code === "string" ? response.code : null;
  const message = typeof response.message === "string" ? response.message : null;

  if (code && message) return `${code}: ${message}`;
  return message ?? code;
}

function getStatusClass(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "rejected") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const paymentRows = await db
    .select({
      id: payments.id,
      username: users.username,
      status: payments.status,
      amountBaht: payments.amountBaht,
      pointsGranted: payments.pointsGranted,
      externalReference: payments.externalReference,
      rawResponse: payments.rawResponse,
      createdAt: payments.createdAt,
      verifiedAt: payments.verifiedAt,
    })
    .from(payments)
    .innerJoin(users, eq(payments.userId, users.id))
    .orderBy(desc(payments.createdAt))
    .limit(100);

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Payments</h1>
            <p className="mt-1 text-sm text-muted-foreground">Latest TrueMoney top-ups and verification results.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {paymentRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No payments yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Customer top-ups will appear here after submission.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentRows.map((payment) => {
              const errorMessage = getPaymentError(payment.rawResponse);

              return (
                <article key={payment.id} className="rounded-lg border p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{payment.username}</h2>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Created {payment.createdAt.toLocaleString("th-TH")}
                        {payment.verifiedAt ? ` / Verified ${payment.verifiedAt.toLocaleString("th-TH")}` : ""}
                      </p>
                    </div>
                    <div className="rounded-md bg-secondary px-3 py-2 text-right">
                      <p className="text-xs text-muted-foreground">Granted</p>
                      <p className="font-semibold">{payment.pointsGranted} Point</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="mt-1 font-medium">{payment.amountBaht} THB</p>
                    </div>
                    <div className="rounded-md border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="mt-1 break-all font-medium">{formatReference(payment.externalReference)}</p>
                    </div>
                    <div className="rounded-md border px-3 py-2">
                      <p className="text-xs text-muted-foreground">Payment ID</p>
                      <p className="mt-1 break-all font-medium">{formatReference(payment.id)}</p>
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {errorMessage}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
