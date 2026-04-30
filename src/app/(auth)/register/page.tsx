import Link from "next/link";

import { registerAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "กรุณาตรวจสอบข้อมูลสมัครสมาชิกอีกครั้ง",
  duplicate: "username หรือ email นี้ถูกใช้งานแล้ว",
  "rate-limit": "สมัครสมาชิกถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Cozin
          </Link>
          <h1 className="text-2xl font-semibold">สมัครสมาชิก</h1>
          <p className="text-sm text-muted-foreground">ใช้ username และ password ได้เลย ส่วน email ใส่หรือไม่ใส่ก็ได้</p>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form action={registerAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Confirm password</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <Button type="submit" className="w-full">
            สมัครสมาชิก
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </section>
    </main>
  );
}
