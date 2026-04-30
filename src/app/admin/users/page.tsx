import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { adjustUserPointsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
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
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin admin</p>
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review customer balances and apply audited Point adjustments.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        {params?.adjusted ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Point adjustment completed.
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-lg border p-5">
          <h2 className="font-semibold">Recent adjustments</h2>
          {recentAdjustments.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No manual adjustments yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentAdjustments.map((adjustment) => (
                <div key={adjustment.id} className="rounded-md border px-3 py-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium">{adjustment.username}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {adjustment.createdAt.toLocaleString("th-TH")} / Balance after {adjustment.balanceAfter} Point
                      </p>
                    </div>
                    <p className={`text-sm font-semibold ${adjustment.points > 0 ? "text-emerald-700" : "text-destructive"}`}>
                      {adjustment.points > 0 ? "+" : ""}
                      {adjustment.points} Point
                    </p>
                  </div>
                  {adjustment.note ? <p className="mt-2 text-sm text-muted-foreground">{adjustment.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {userRows.length === 0 ? (
          <div className="rounded-lg border p-5">
            <h2 className="font-semibold">No users yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Registered users will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userRows.map((user) => (
              <article key={user.id} className="rounded-lg border p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{user.username}</h2>
                      <span className="rounded-md border bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {user.role}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {user.email ?? "No email"} / Joined {user.createdAt.toLocaleString("th-TH")}
                    </p>
                  </div>
                  <div className="rounded-md bg-secondary px-3 py-2 text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-semibold">{user.points} Point</p>
                  </div>
                </div>

                <form action={adjustUserPointsAction} className="mt-5 grid gap-3 lg:grid-cols-[10rem_1fr_auto]">
                  <input type="hidden" name="userId" value={user.id} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Point delta</span>
                    <input
                      name="pointsDelta"
                      type="number"
                      step={1}
                      required
                      placeholder="+10 or -5"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Reason</span>
                    <input
                      name="reason"
                      required
                      minLength={3}
                      maxLength={500}
                      placeholder="Customer support adjustment"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </label>
                  <div className="flex items-end">
                    <Button type="submit" variant="outline">
                      Apply
                    </Button>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
