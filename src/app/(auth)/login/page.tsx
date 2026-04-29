import Link from "next/link";

import { loginAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    registered?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "กรุณากรอก username และ password ให้ถูกต้อง",
  credentials: "username หรือ password ไม่ถูกต้อง",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Cozin
          </Link>
          <h1 className="text-2xl font-semibold">เข้าสู่ระบบ</h1>
          <p className="text-sm text-muted-foreground">ล็อกอินเพื่อเติม Point และซื้อรหัส Roblox</p>
        </div>

        {params?.registered ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            สมัครสมาชิกสำเร็จแล้ว ล็อกอินเพื่อเริ่มใช้งานได้เลย
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <Button type="submit" className="w-full">
            เข้าสู่ระบบ
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </section>
    </main>
  );
}
