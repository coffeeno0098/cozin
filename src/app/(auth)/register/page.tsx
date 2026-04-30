import Image from "next/image";
import Link from "next/link";

import { registerAction } from "@/app/(auth)/actions";

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
          <h1 className="text-display-lg mt-5">สมัครสมาชิก</h1>
          <p className="text-caption mt-2 text-[var(--muted-foreground)]">
            ใช้ username และ password ได้เลย ส่วน email ใส่หรือไม่ใส่ก็ได้
          </p>
        </div>

        <div aria-live="polite" className="mt-5">
          {errorMessage ? (
            <div className="alert-error">{errorMessage}</div>
          ) : null}
        </div>

        <form action={registerAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-caption-strong">Username</span>
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
              spellCheck={false}
              className="input-apple"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-caption-strong">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              className="input-apple"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-caption-strong">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input-apple"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-caption-strong">Confirm Password</span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="input-apple"
            />
          </label>
          <button type="submit" className="btn-pill w-full mt-2">
            สมัครสมาชิก
          </button>
        </form>

        <p className="mt-6 text-center text-caption text-[var(--muted-foreground)]">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline underline-offset-4"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </section>
    </main>
  );
}
