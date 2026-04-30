import Image from "next/image";
import Link from "next/link";

import { loginAction } from "@/app/(auth)/actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    registered?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "กรุณากรอก username และ password ให้ถูกต้อง",
  credentials: "username หรือ password ไม่ถูกต้อง",
  "rate-limit": "ลองเข้าสู่ระบบถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-parchment)] px-6 py-10">
      <section className="w-full max-w-md animate-scale-in utility-card p-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Cozin"
              width={48}
              height={48}
              className="rounded-lg"
              priority
            />
          </Link>
          <h1 className="text-display-lg mt-5">เข้าสู่ระบบ</h1>
          <p className="text-caption mt-2 text-[var(--muted-foreground)]">
            ล็อกอินเพื่อเติม Point และซื้อรหัส <span translate="no">Roblox</span>
          </p>
        </div>

        <div aria-live="polite" className="mt-5">
          {params?.registered ? (
            <div className="alert-success">
              สมัครสมาชิกสำเร็จแล้ว ล็อกอินเพื่อเริ่มใช้งานได้เลย
            </div>
          ) : null}

          {errorMessage ? (
            <div className="alert-error">{errorMessage}</div>
          ) : null}
        </div>

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-caption-strong">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              spellCheck={false}
              className="input-apple"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-caption-strong">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="input-apple"
            />
          </label>
          <button type="submit" className="btn-pill w-full mt-2">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-6 text-center text-caption text-[var(--muted-foreground)]">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--primary)] hover:underline underline-offset-4"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </section>
    </main>
  );
}
