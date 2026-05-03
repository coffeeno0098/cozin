import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { normalizeAdminSearch, parseAdminPaymentStatus } from "@/lib/admin-list-filters";

export const dynamic = "force-dynamic";

type RawPaymentResponse = {
  code?: unknown;
  message?: unknown;
};

function formatReference(reference: string | null) {
  if (!reference) return "No reference";
  if (reference.length <= 12) return reference;

  return `${reference.slice(0, 6)}…${reference.slice(-4)}`;
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

function getStatusBadge(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "badge-success";
  if (status === "rejected") return "badge-error";
  return "badge-warning";
}

type AdminPaymentsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

function buildPaymentsFilterHref(status: string | null, query: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/admin/payments?${search}` : "/admin/payments";
}

export default async function AdminPaymentsPage({ searchParams }: AdminPaymentsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const query = normalizeAdminSearch(params?.q);
  const status = parseAdminPaymentStatus(params?.status);
  const conditions: SQL[] = [];

  if (status) {
    conditions.push(eq(payments.status, status));
  }

  if (query) {
    const likeQuery = `%${query}%`;
    const searchCondition = or(
      ilike(users.username, likeQuery),
      ilike(payments.externalReference, likeQuery),
      sql`cast(${payments.id} as text) ilike ${likeQuery}`,
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const baseQuery = db
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
    .innerJoin(users, eq(payments.userId, users.id));

  const paymentRows = await (whereClause ? baseQuery.where(whereClause) : baseQuery)
    .orderBy(desc(payments.createdAt))
    .limit(100);
  const hasFilters = Boolean(query || status);
  const statusTabs = [
    { label: "All", value: null },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <>
      <SiteNav />

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Payments</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Latest TrueMoney top-ups and verification results.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="utility-card animate-fade-in-up">
              <form className="flex flex-col gap-3 md:flex-row md:items-end" action="/admin/payments">
                <div className="flex-1">
                  <label htmlFor="payment-q" className="text-fine-print text-[var(--muted-foreground)]">
                    Search
                  </label>
                  <input
                    id="payment-q"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Username, payment ID, or voucher reference"
                    className="mt-1 w-full rounded-xl border border-[var(--hairline)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]"
                  />
                </div>
                {status ? <input type="hidden" name="status" value={status} /> : null}
                <button type="submit" className="btn-pill text-caption px-4 py-2.5">
                  Search
                </button>
                {hasFilters ? (
                  <Link href="/admin/payments" className="btn-pill-ghost text-caption px-4 py-2.5 text-center">
                    Clear
                  </Link>
                ) : null}
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {statusTabs.map((tab) => {
                  const active = tab.value === status;
                  return (
                    <Link
                      key={tab.label}
                      href={buildPaymentsFilterHref(tab.value, query)}
                      className={active ? "badge-success" : "badge-neutral"}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {paymentRows.length === 0 ? (
              <div className="utility-card animate-fade-in-up">
                <h2 className="text-body-strong">{hasFilters ? "No Matching Payments" : "No Payments Yet"}</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">
                  {hasFilters ? "Try another search or clear the current filters." : "Customer top-ups will appear here after submission."}
                </p>
              </div>
            ) : (
              paymentRows.map((payment, i) => {
                const errorMessage = getPaymentError(payment.rawResponse);
                return (
                  <article key={payment.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-body-strong truncate">{payment.username}</h2>
                          <span className={getStatusBadge(payment.status)}>{payment.status}</span>
                        </div>
                        <p className="text-fine-print mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                          Created {payment.createdAt.toLocaleString("th-TH")}
                          {payment.verifiedAt ? ` · Verified ${payment.verifiedAt.toLocaleString("th-TH")}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Granted</p>
                        <p className="text-body-strong tabular-nums">{payment.pointsGranted} Point</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-[var(--hairline)] px-4 py-2.5">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Amount</p>
                        <p className="text-caption-strong tabular-nums mt-0.5">{payment.amountBaht} THB</p>
                      </div>
                      <div className="rounded-xl border border-[var(--hairline)] px-4 py-2.5">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Reference</p>
                        <p className="text-caption-strong mt-0.5 break-all">{formatReference(payment.externalReference)}</p>
                      </div>
                      <div className="rounded-xl border border-[var(--hairline)] px-4 py-2.5">
                        <p className="text-fine-print text-[var(--muted-foreground)]">Payment ID</p>
                        <p className="text-caption-strong mt-0.5 break-all">{formatReference(payment.id)}</p>
                      </div>
                    </div>

                    {errorMessage ? (
                      <div className="alert-error mt-4">{errorMessage}</div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
