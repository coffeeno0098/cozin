"use client";

import { useState } from "react";

type OrderHistoryItem = {
  id: string;
  productName: string;
  gameMap: string;
  pricePoints: number;
  status: string;
  createdAt: string;
  gameAccountId: string;
  gamePassword: string;
};

type TopupHistoryItem = {
  id: string;
  amountBaht: number;
  pointsGranted: number;
  status: string;
  externalReference: string | null;
  createdAt: string;
  verifiedAt: string | null;
};

type OrderHistoryListProps = {
  orders: OrderHistoryItem[];
  topups: TopupHistoryItem[];
};

type CopyState = "idle" | "copied" | "failed";
type ActiveHistoryTab = "orders" | "topups";

function getStatusLabel(status: string) {
  if (status === "fulfilled") return "สำเร็จ";
  if (status === "paid") return "ชำระแล้ว";
  if (status === "cancelled") return "ยกเลิก";
  if (status === "refunded") return "คืนเงิน";
  return status;
}

function getStatusClass(status: string) {
  if (status === "fulfilled") return "badge-success";
  if (status === "cancelled" || status === "refunded") return "badge-error";
  return "badge-neutral";
}

function getTopupStatusLabel(status: string) {
  if (status === "verified") return "สำเร็จ";
  if (status === "pending") return "รอตรวจสอบ";
  if (status === "rejected") return "ไม่สำเร็จ";
  return status;
}

function getTopupStatusClass(status: string) {
  if (status === "verified") return "badge-success";
  if (status === "rejected") return "badge-error";
  return "badge-warning";
}

function formatReference(reference: string | null) {
  if (!reference) return "-";
  if (reference.length <= 12) return reference;

  return `${reference.slice(0, 6)}…${reference.slice(-4)}`;
}

function EmptyHistoryState({ description }: { description: string }) {
  return (
    <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ background: "radial-gradient(ellipse at center, #818cf8, transparent 70%)" }}
      />
      <div className="relative">
        <div
          className="mx-auto grid size-16 place-items-center rounded-3xl text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)", boxShadow: "0 8px 32px rgba(129,140,248,0.2)" }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-tagline mt-5 text-white">ไม่พบข้อมูล</h2>
        <p className="text-caption mt-2 text-white/55">{description}</p>
      </div>
    </div>
  );
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function OrderHistoryList({ orders, topups }: OrderHistoryListProps) {
  const [activeTab, setActiveTab] = useState<ActiveHistoryTab>("orders");
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [idCopyState, setIdCopyState] = useState<CopyState>("idle");
  const [passwordCopyState, setPasswordCopyState] = useState<CopyState>("idle");

  function openCode(order: OrderHistoryItem) {
    setSelectedOrder(order);
    setIdCopyState("idle");
    setPasswordCopyState("idle");
  }

  function closeCode() {
    setSelectedOrder(null);
  }

  async function handleCopy(kind: "id" | "password", value: string) {
    const setState = kind === "id" ? setIdCopyState : setPasswordCopyState;

    try {
      await copyToClipboard(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <>
      <div className="space-y-5">
        {/* ── Tab switcher ── */}
        <div className="grid gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-4 text-caption-strong transition ${
              activeTab === "orders"
                ? "text-white shadow-[0_16px_40px_rgba(129,140,248,0.12)]"
                : "text-white/58 hover:bg-white/[0.05] hover:text-white"
            }`}
            style={activeTab === "orders" ? { background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%)", border: "1px solid rgba(129,140,248,0.2)" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={activeTab === "orders" ? { color: "#a78bfa" } : undefined}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ประวัติการสั่งซื้อ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("topups")}
            className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-4 text-caption-strong transition ${
              activeTab === "topups"
                ? "text-white shadow-[0_16px_40px_rgba(129,140,248,0.12)]"
                : "text-white/58 hover:bg-white/[0.05] hover:text-white"
            }`}
            style={activeTab === "topups" ? { background: "linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(56,189,248,0.15) 100%)", border: "1px solid rgba(96,165,250,0.2)" } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={activeTab === "topups" ? { color: "#60a5fa" } : undefined}>
              <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 10h22" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            ประวัติการเติมเงิน
          </button>
        </div>

        {/* ── Tab content ── */}
        {activeTab === "orders" ? (
          orders.length === 0 ? (
            <EmptyHistoryState description="ยังไม่มีรายการซื้อในประวัตินี้" />
          ) : (
            <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              {/* ── Table header ── */}
              <div className="relative hidden grid-cols-[1fr_140px_150px_180px_120px_130px] gap-4 border-b border-white/10 px-5 py-4 text-caption-strong text-white/55 lg:grid">
                <span className="flex items-center gap-2">
                  <span className="inline-block size-1.5 rounded-full" style={{ background: "#a78bfa" }} />
                  สินค้า
                </span>
                <span>Map</span>
                <span>จำนวนเงิน</span>
                <span>เวลา</span>
                <span>สถานะ</span>
                <span className="text-right">รหัส</span>
              </div>

              {/* ── Order rows ── */}
              <div className="divide-y divide-white/[0.06]">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="group relative grid gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] lg:grid-cols-[1fr_140px_150px_180px_120px_130px] lg:items-center"
                  >
                    {/* Left accent on hover */}
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ background: "linear-gradient(180deg, #a78bfa, #60a5fa)" }}
                    />

                    <div className="min-w-0">
                      <p className="text-body-strong truncate text-white">{order.productName}</p>
                      <p className="text-caption mt-1 text-white/55 lg:hidden">{order.gameMap}</p>
                    </div>

                    <p className="hidden truncate text-caption text-white/62 lg:block">{order.gameMap}</p>

                    <div>
                      <p className="text-fine-print text-white/45 lg:hidden">จำนวนเงิน</p>
                      <p className="text-caption-strong tabular-nums text-white">{order.pricePoints} Point</p>
                    </div>

                    <p className="text-caption text-white/62" suppressHydrationWarning>
                      {order.createdAt}
                    </p>

                    <div>
                      <span className={getStatusClass(order.status)}>{getStatusLabel(order.status)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openCode(order)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-caption-strong text-white transition lg:justify-self-end"
                      style={{
                        background: "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%)",
                        border: "1px solid rgba(129,140,248,0.25)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(167,139,250,0.25) 0%, rgba(96,165,250,0.25) 100%)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(96,165,250,0.15) 100%)"; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#a78bfa" }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      ดูรหัส
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )
        ) : topups.length === 0 ? (
          <EmptyHistoryState description="ยังไม่มีรายการเติมเงินในประวัตินี้" />
        ) : (
          <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            {/* ── Topup table header ── */}
            <div className="relative hidden grid-cols-[1fr_150px_150px_180px_130px] gap-4 border-b border-white/10 px-5 py-4 text-caption-strong text-white/55 lg:grid">
              <span className="flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full" style={{ background: "#60a5fa" }} />
                รายการ
              </span>
              <span>จำนวนเงิน</span>
              <span>Point</span>
              <span>เวลา</span>
              <span className="text-right">สถานะ</span>
            </div>

            {/* ── Topup rows ── */}
            <div className="divide-y divide-white/[0.06]">
              {topups.map((topup) => (
                <article key={topup.id} className="group relative grid gap-4 px-5 py-5 transition-colors hover:bg-white/[0.02] lg:grid-cols-[1fr_150px_150px_180px_130px] lg:items-center">
                  {/* Left accent on hover */}
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: "linear-gradient(180deg, #60a5fa, #38bdf8)" }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#60a5fa" }} className="shrink-0">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-body-strong truncate text-white">เติม Point</p>
                    </div>
                    <p className="text-caption mt-1 text-white/55">Ref {formatReference(topup.externalReference)}</p>
                  </div>

                  <div>
                    <p className="text-fine-print text-white/45 lg:hidden">จำนวนเงิน</p>
                    <p className="text-caption-strong tabular-nums text-white">{topup.amountBaht} บาท</p>
                  </div>

                  <div>
                    <p className="text-fine-print text-white/45 lg:hidden">Point</p>
                    <p className="text-caption-strong tabular-nums text-white">{topup.pointsGranted} Point</p>
                  </div>

                  <div>
                    <p className="text-caption text-white/62" suppressHydrationWarning>{topup.createdAt}</p>
                    {topup.verifiedAt ? (
                      <p className="text-fine-print mt-1 text-white/42" suppressHydrationWarning>
                        ยืนยัน {topup.verifiedAt}
                      </p>
                    ) : null}
                  </div>

                  <div className="lg:text-right">
                    <span className={getTopupStatusClass(topup.status)}>{getTopupStatusLabel(topup.status)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedOrder ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/72 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-code-title"
          onClick={closeCode}
          style={{ animation: "fadeIn .2s ease-out" }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/14 bg-[#0b0b0b] text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
            style={{ animation: "slideUp .25s ease-out" }}
          >
            {/* ── Gradient accent bar ── */}
            <div
              className="h-1"
              style={{ background: "linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa)" }}
            />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-caption text-white/55">{selectedOrder.gameMap}</p>
                  <h2 id="order-code-title" className="text-tagline mt-1 truncate text-white">
                    {selectedOrder.productName}
                  </h2>
                  <p className="text-caption mt-2 text-white/55">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mr-1.5 inline-block -translate-y-px" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    รหัสนี้เป็นข้อมูลส่วนตัวของคุณ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCode}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="ปิดหน้าต่างรหัส"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {/* ── ID credential ── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-caption-strong text-white/70">Account ID</span>
                  </div>
                  <p
                    className="mt-3 break-all rounded-xl bg-black/50 px-4 py-3 text-white"
                    style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: "0.95rem", letterSpacing: "0.03em", lineHeight: 1.6 }}
                  >
                    {selectedOrder.gameAccountId}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy("id", selectedOrder.gameAccountId)}
                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 py-2 text-caption-strong transition"
                    style={{
                      background: idCopyState === "copied" ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)",
                      color: idCopyState === "copied" ? "#34d399" : idCopyState === "failed" ? "#f87171" : "rgba(255,255,255,0.85)",
                      border: idCopyState === "copied" ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {idCopyState === "copied" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    {idCopyState === "copied" ? "คัดลอกแล้ว" : idCopyState === "failed" ? "คัดลอกไม่สำเร็จ" : "คัดลอก ID"}
                  </button>
                </div>

                {/* ── Password credential ── */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 100%)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="text-caption-strong text-white/70">Password</span>
                  </div>
                  <p
                    className="mt-3 break-all rounded-xl bg-black/50 px-4 py-3 text-white"
                    style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: "0.95rem", letterSpacing: "0.03em", lineHeight: 1.6 }}
                  >
                    {selectedOrder.gamePassword}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy("password", selectedOrder.gamePassword)}
                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 py-2 text-caption-strong transition"
                    style={{
                      background: passwordCopyState === "copied" ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)",
                      color: passwordCopyState === "copied" ? "#34d399" : passwordCopyState === "failed" ? "#f87171" : "rgba(255,255,255,0.85)",
                      border: passwordCopyState === "copied" ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {passwordCopyState === "copied" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                    {passwordCopyState === "copied" ? "คัดลอกแล้ว" : passwordCopyState === "failed" ? "คัดลอกไม่สำเร็จ" : "คัดลอก Password"}
                  </button>
                </div>
              </div>

              <button type="button" onClick={closeCode} className="btn-pill mt-6 w-full px-5 py-3 text-caption">
                ปิด
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
