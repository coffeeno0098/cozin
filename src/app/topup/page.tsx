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
        <section className="tile-parchment tile-section py-12">
          <div className="mx-auto max-w-4xl animate-fade-in-up">
            <div>
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
        <section className="tile-light tile-section">
          <div className="mx-auto max-w-4xl space-y-8">
            <div aria-live="polite">
              {params?.success ? (
                <div className="alert-success animate-fade-in">
                  เติมเงินสำเร็จ เพิ่ม {params.amount ?? "0"} Point เข้าบัญชีแล้ว
                </div>
              ) : null}
              {params?.error ? (
                <div className="alert-error animate-fade-in">
                  {getTopupErrorMessage(params.error, params.reason)}
                </div>
              ) : null}
            </div>

            {/* ── Gift link form ── */}
            <form action={createTopupAction} className="utility-card animate-fade-in-up delay-1">
              <h2 className="text-body-strong">
                ลิงก์ซอง <span translate="no">TrueMoney</span>
              </h2>
              <p className="text-caption mt-1 text-[var(--muted-foreground)]">
                ระบบจะแปลงยอดเงินเป็น Point อัตโนมัติ โดย 1 บาท = 1 Point
              </p>
              <label className="mt-5 block space-y-2">
                <span className="text-caption-strong">ลิงก์ซอง</span>
                <input
                  name="voucherUrl"
                  type="url"
                  required
                  spellCheck={false}
                  placeholder="https://gift.truemoney.com/campaign/?v=…"
                  className="input-pill"
                />
              </label>
              <button type="submit" className="btn-pill mt-5">
                เติม Point
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
