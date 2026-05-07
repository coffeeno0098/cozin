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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-10">
      {/* Background grid + glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(129,140,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{ width: "600px", height: "400px", background: "radial-gradient(ellipse at center top, rgba(167,139,250,0.15), transparent 70%)" }}
      />
      <section className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* Gradient accent bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }} />

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="inline-block">
              <div
                className="grid size-16 place-items-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%)", border: "1px solid rgba(129,140,248,0.2)", boxShadow: "0 8px 28px rgba(129,140,248,0.1)" }}
              >
                <Image
                  src="/logomain.png"
                  alt="Cozin"
                  width={56}
                  height={56}
                  className="rounded-xl"
                  priority
                />
              </div>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-white">เข้าสู่ระบบ</h1>
            <p className="text-caption mt-2 text-white/55">
              ล็อกอินเพื่อเติม Point และซื้อรหัส <span translate="no">Roblox</span>
            </p>
          </div>

          <div aria-live="polite" className="mt-5">
            {params?.registered ? (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium"
                style={{ background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,199,89,0.25)", color: "#34d399" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>สมัครสมาชิกสำเร็จแล้ว ล็อกอินเพื่อเริ่มใช้งานได้เลย</span>
              </div>
            ) : null}

            {errorMessage ? (
              <div
                className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium"
                style={{ background: "rgba(255,59,48,0.06)", borderColor: "rgba(255,59,48,0.2)", color: "#ff6b6b" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            ) : null}
          </div>

          <form action={loginAction} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
                <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                Username
              </span>
              <input
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={32}
                spellCheck={false}
                className="input-apple"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(129,140,248,0.15)", color: "#fff" }}
              />
            </label>
            <label className="block space-y-2">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/80">
                <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="input-apple"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(129,140,248,0.15)", color: "#fff" }}
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 6px 24px rgba(129,140,248,0.3)" }}
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="mt-6 text-center text-caption text-white/45">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors hover:underline underline-offset-4"
              style={{ color: "#a78bfa" }}
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
