import { redirect } from "next/navigation";

import { createTopupAction } from "@/app/topup/actions";
import { auth } from "@/auth";
import { SiteNav } from "@/components/site-nav";

type TopupPageProps = {
  searchParams?: Promise<{
    amount?: string;
    error?: string;
    reason?: string;
    success?: string;
  }>;
};

function getTopupErrorMessage(error?: string, reason?: string) {
  if (error === "invalid") return "กรุณากรอกลิงก์ซอง TrueMoney ให้ถูกต้อง";
  if (error === "config") return "ระบบเติมเงินยังไม่พร้อมใช้งาน กรุณาตั้งค่า TRUEMONEY_RECEIVER_PHONE ก่อน";
  if (error === "duplicate") return "ลิงก์ซอง TrueMoney นี้ถูกใช้งานไปแล้ว";
  if (error === "processing") return "ลิงก์ซอง TrueMoney นี้กำลังถูกตรวจสอบอยู่";
  if (error === "rate-limit") return "มีการเติมเงินถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (error === "redeem") return reason || "TrueMoney ไม่สามารถตรวจสอบลิงก์ซองนี้ได้";
  return "เติมเงินไม่สำเร็จ กรุณาตรวจสอบลิงก์ซองแล้วลองใหม่";
}

export const dynamic = "force-dynamic";

export default async function TopupPage({ searchParams }: TopupPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <>
      {/* ── Nav ── */}
      <SiteNav />

      <main id="main-content" className="flex-1">
        {/* ── Header (parchment) ── */}
        <section className="tile-parchment tile-section relative overflow-hidden py-12">
          {/* Decorative background glow */}
          <div
            className="pointer-events-none absolute -right-32 -top-32 hidden size-96 rounded-full opacity-[0.06] blur-[100px] lg:block"
            style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 hidden size-72 rounded-full opacity-[0.04] blur-[80px] lg:block"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-4xl animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div
                className="grid size-14 shrink-0 place-items-center rounded-2xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 28px rgba(129,140,248,0.25)" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-display-lg">เติม Point</h1>
                <p className="text-body mt-1 text-[var(--muted-foreground)]">
                  ส่งลิงก์ซอง <span translate="no">TrueMoney</span> เพื่อให้ระบบตรวจสอบอัตโนมัติ
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Top-up form ── */}
        <section className="tile-light tile-section relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-24 top-12 hidden size-80 rounded-full opacity-[0.04] blur-[80px] lg:block"
            style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-4xl space-y-8">
            <div aria-live="polite">
              {params?.success ? (
                <div
                  className="animate-fade-in flex items-start gap-3 rounded-2xl border px-5 py-4 text-caption-strong"
                  style={{ background: "rgba(52,211,153,0.06)", borderColor: "rgba(52,199,89,0.3)", color: "#248a3d" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>เติมเงินสำเร็จ เพิ่ม {params.amount ?? "0"} Point เข้าบัญชีแล้ว</span>
                </div>
              ) : null}
              {params?.error ? (
                <div
                  className="animate-fade-in flex items-start gap-3 rounded-2xl border px-5 py-4 text-caption-strong"
                  style={{ background: "rgba(255,59,48,0.04)", borderColor: "rgba(255,59,48,0.25)", color: "oklch(0.577 0.245 27.325)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>{getTopupErrorMessage(params.error, params.reason)}</span>
                </div>
              ) : null}
            </div>

            {/* ── Gift link form ── */}
            <form action={createTopupAction} className="animate-fade-in-up delay-1 overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--background)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              {/* Gradient accent bar */}
              <div
                className="h-1"
                style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
              />

              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-8 shrink-0 place-items-center rounded-lg"
                    style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(96,165,250,0.12) 100%)", border: "1px solid rgba(129,140,248,0.15)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#818cf8" }}>
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-body-strong">
                      ลิงก์ซอง <span translate="no">TrueMoney</span>
                    </h2>
                    <p className="text-caption mt-0.5 text-[var(--muted-foreground)]">
                      ระบบจะแปลงยอดเงินเป็น Point อัตโนมัติ โดย 1 บาท = 1 Point
                    </p>
                  </div>
                </div>

                <label className="mt-6 block space-y-2">
                  <span className="flex items-center gap-1.5 text-caption-strong">
                    <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                    ลิงก์ซอง
                  </span>
                  <input
                    name="voucherUrl"
                    type="url"
                    required
                    spellCheck={false}
                    placeholder="https://gift.truemoney.com/campaign/?v=…"
                    className="input-pill"
                    style={{ borderColor: "rgba(129,140,248,0.15)" }}
                  />
                </label>

                <button
                  type="submit"
                  className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition"
                  style={{
                    background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)",
                    boxShadow: "0 6px 24px rgba(129,140,248,0.3)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  เติม Point
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
