import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { adjustUserPointsAction } from "@/app/admin/actions";
import { db } from "@/db";
import { pointTransactions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    adjusted?: string;
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "Please check the adjustment form.",
  "not-found": "User was not found.",
  negative: "This adjustment would make the user balance negative.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  const [userRows, recentAdjustments] = await Promise.all([
    db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        points: users.points,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100),
    db
      .select({
        id: pointTransactions.id,
        username: users.username,
        points: pointTransactions.points,
        balanceAfter: pointTransactions.balanceAfter,
        note: pointTransactions.note,
        createdAt: pointTransactions.createdAt,
      })
      .from(pointTransactions)
      .innerJoin(users, eq(pointTransactions.userId, users.id))
      .where(eq(pointTransactions.type, "adjustment"))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(10),
  ]);

  return (
    <>
      <div className="global-nav">
        <Link href="/admin" className="text-nav-link font-semibold uppercase tracking-wide" translate="no">Cozin Admin</Link>
        <Link href="/admin" className="text-nav-link opacity-85 hover:opacity-100">← Dashboard</Link>
      </div>

      <main id="main-content" className="flex-1">
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-6xl animate-fade-in-up">
            <p className="text-caption text-[var(--muted-foreground)]"><span translate="no">Cozin</span> Admin</p>
            <h1 className="text-display-lg mt-1">Users</h1>
            <p className="text-body mt-1 text-[var(--muted-foreground)]">Review customer balances and apply audited Point adjustments.</p>
          </div>
        </section>

        <section className="tile-light tile-section">
          <div className="mx-auto max-w-6xl space-y-6">
            <div aria-live="polite">
              {params?.adjusted ? <div className="alert-success">Point adjustment completed.</div> : null}
              {errorMessage ? <div className="alert-error">{errorMessage}</div> : null}
            </div>

            {/* ── Recent adjustments ── */}
            <div className="utility-card animate-fade-in-up">
              <h2 className="text-body-strong">Recent Adjustments</h2>
              {recentAdjustments.length === 0 ? (
                <p className="text-caption mt-3 text-[var(--muted-foreground)]">No manual adjustments yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentAdjustments.map((adj) => (
                    <div key={adj.id} className="rounded-xl border border-[var(--hairline)] px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-caption-strong">{adj.username}</p>
                          <p className="text-fine-print mt-0.5 text-[var(--muted-foreground)]" suppressHydrationWarning>
                            {adj.createdAt.toLocaleString("th-TH")} · Balance after {adj.balanceAfter} Point
                          </p>
                        </div>
                        <p className={`text-caption-strong tabular-nums ${adj.points > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {adj.points > 0 ? "+" : ""}{adj.points} Point
                        </p>
                      </div>
                      {adj.note ? <p className="text-caption mt-2 text-[var(--muted-foreground)]">{adj.note}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── User list ── */}
            {userRows.length === 0 ? (
              <div className="utility-card">
                <h2 className="text-body-strong">No Users Yet</h2>
                <p className="text-caption mt-2 text-[var(--muted-foreground)]">Registered users will appear here.</p>
              </div>
            ) : (
              userRows.map((user, i) => (
                <article key={user.id} className={`utility-card animate-fade-in-up ${i < 5 ? `delay-${i + 1}` : ""}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-body-strong truncate">{user.username}</h2>
                        <span className="badge-neutral">{user.role}</span>
                      </div>
                      <p className="text-caption mt-1 text-[var(--muted-foreground)]" suppressHydrationWarning>
                        {user.email ?? "No email"} · Joined {user.createdAt.toLocaleString("th-TH")}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-[var(--surface-parchment)] px-4 py-2.5 text-right">
                      <p className="text-fine-print text-[var(--muted-foreground)]">Balance</p>
                      <p className="text-body-strong tabular-nums">{user.points} Point</p>
                    </div>
                  </div>

                  <form action={adjustUserPointsAction} className="mt-5 grid gap-3 lg:grid-cols-[10rem_1fr_auto]">
                    <input type="hidden" name="userId" value={user.id} />
                    <label className="block space-y-1.5">
                      <span className="text-caption-strong">Point Delta</span>
                      <input name="pointsDelta" type="number" step={1} required placeholder="+10 or −5" className="input-apple" />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-caption-strong">Reason</span>
                      <input name="reason" required minLength={3} maxLength={500} placeholder="Customer support adjustment…" className="input-apple" />
                    </label>
                    <div className="flex items-end">
                      <button type="submit" className="btn-pill-ghost text-caption px-4 py-2">Apply</button>
                    </div>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
