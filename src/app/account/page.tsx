import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { auth } from "@/auth";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user] = await db
    .select({
      username: users.username,
      email: users.email,
      points: users.points,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cozin account</p>
            <h1 className="text-2xl font-semibold">{user.username}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/products">Products</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/topup">Top up</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/orders">Purchase history</Link>
            </Button>
            {user.role === "admin" ? (
              <Button asChild>
                <Link href="/admin">Admin dashboard</Link>
              </Button>
            ) : null}
            <form action={logoutAction}>
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </div>
        <AnnouncementBar />

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Point</p>
            <p className="mt-2 text-3xl font-semibold">{user.points}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-2 break-all text-sm font-medium">{user.email ?? "Not set"}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="mt-2 text-sm font-medium">{user.role}</p>
          </div>
        </div>

        {user.role === "admin" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Products</h2>
              <p className="mt-2 text-sm text-muted-foreground">Add products, set prices, and control visibility.</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/products">Manage products</Link>
              </Button>
            </div>
            <div className="rounded-lg border p-5">
              <h2 className="font-semibold">Game codes</h2>
              <p className="mt-2 text-sm text-muted-foreground">Add ID and password stock for products.</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href="/admin/codes">Manage codes</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
