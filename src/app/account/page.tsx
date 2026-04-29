import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { auth } from "@/auth";
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
        <div className="flex items-center justify-between border-b pb-5">
          <div>
            <p className="text-sm text-muted-foreground">Cozin account</p>
            <h1 className="text-2xl font-semibold">{user.username}</h1>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              ออกจากระบบ
            </Button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Point</p>
            <p className="mt-2 text-3xl font-semibold">{user.points}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-2 break-all text-sm font-medium">{user.email ?? "ยังไม่ได้ใส่"}</p>
          </div>
          <div className="rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="mt-2 text-sm font-medium">{user.role}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
