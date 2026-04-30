import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createTopupAction } from "@/app/topup/actions";
import { auth } from "@/auth";
import { AnnouncementBar } from "@/components/announcement-bar";
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
  if (error === "rate-limit") return "Too many top-up attempts. Please wait a moment and try again.";
  if (error === "redeem") return reason || "TrueMoney could not verify this gift link.";
  return "Top-up failed. Please check the gift link and try again.";
}

function getPaymentBadge(status: string) {
  if (status === "verified") return "badge-success";
  if (status === "rejected") return "badge-error";
  return "badge-warning";
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
    <>
      {/* ── Nav ── */}
      <div className="global-nav">
        <Link href="/" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">
          Cozin
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-nav-link opacity-85 hover:opacity-100">Products</Link>
          <Link href="/account" className="text-nav-link opacity-85 hover:opacity-100">Account</Link>
        </div>
      </div>
      <AnnouncementBar />

      <main id="main-content" className="flex-1">
        {/* ── Header (parchment) ── */}
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]">
              <span translate="no">Cozin</span> Account
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-display-lg">Top Up Point</h1>
                <p className="text-body mt-1 text-[var(--muted-foreground)]">
                  Submit a <span translate="no">TrueMoney</span> gift link for verification.
                </p>
              </div>
              <Link href="/account" className="btn-pill-ghost text-caption px-4 py-2">
                Back to Account
              </Link>
            </div>
          </div>
        </section>

        {/* ── Form + History ── */}
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl space-y-8">
            <div aria-live="polite">
              {params?.success ? (
                <div className="alert-success animate-fade-in">
                  Top-up completed. {params.amount ?? "0"} Point has been added to your account.
                </div>
              ) : null}
              {params?.error ? (
                <div className="alert-error animate-fade-in">
                  {getTopupErrorMessage(params.error, params.reason)}
                </div>
              ) : null}
            </div>

            {/* ── Gift link form ── */}
            <form action={createTopupAction} className="utility-card animate-fade-in-up delay-1">
              <h2 className="text-body-strong">
                <span translate="no">TrueMoney</span> Gift Link
              </h2>
              <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                The system verifies the gift link and converts 1 baht to 1 Point automatically.
              </p>
              <label className="mt-5 block space-y-2">
                <span className="text-caption-strong">Gift Link</span>
                <input
                  name="voucherUrl"
                  type="url"
                  required
                  spellCheck={false}
                  placeholder="https://gift.truemoney.com/campaign/?v=…"
                  className="input-pill"
                />
              </label>
              <button type="submit" className="btn-pill mt-5">
                Top Up Now
              </button>
            </form>

            {/* ── Recent top-ups ── */}
            <div className="utility-card animate-fade-in-up delay-2">
              <h2 className="text-body-strong">Recent Top-ups</h2>
              {paymentRows.length === 0 ? (
                <p className="text-caption mt-3 text-[var(--muted-foreground)]">
                  No top-up requests yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {paymentRows.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col gap-2 rounded-xl border border-[var(--hairline)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={getPaymentBadge(payment.status)}>
                          {payment.status}
                        </span>
                        <p
                          className="text-fine-print text-[var(--muted-foreground)]"
                          suppressHydrationWarning
                        >
                          {payment.createdAt.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <p className="text-caption tabular-nums text-[var(--muted-foreground)]">
                        {payment.amountBaht} THB → {payment.pointsGranted} Point
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
