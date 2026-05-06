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
    <div className="grid min-h-[280px] place-items-center rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-3xl border border-white/10 bg-white/[0.04] text-white/50">
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
        <div className="grid gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-4 text-caption-strong transition ${
              activeTab === "orders"
                ? "bg-white text-black shadow-[0_16px_40px_rgba(255,255,255,0.08)]"
                : "text-white/58 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span aria-hidden="true">🛍</span>
            ประวัติการสั่งซื้อ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("topups")}
            className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-4 text-caption-strong transition ${
              activeTab === "topups"
                ? "bg-white text-black shadow-[0_16px_40px_rgba(255,255,255,0.08)]"
                : "text-white/58 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span aria-hidden="true">💳</span>
            ประวัติการเติมเงิน
          </button>
        </div>

        {activeTab === "orders" ? (
          orders.length === 0 ? (
            <EmptyHistoryState description="ยังไม่มีรายการซื้อในประวัตินี้" />
          ) : (
            <section className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b0b0b] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <div className="hidden grid-cols-[1fr_140px_150px_180px_120px_130px] gap-4 border-b border-white/10 px-5 py-4 text-caption-strong text-white/55 lg:grid">
                <span>สินค้า</span>
                <span>Map</span>
                <span>จำนวนเงิน</span>
                <span>เวลา</span>
                <span>สถานะ</span>
                <span className="text-right">รหัส</span>
              </div>

              <div className="divide-y divide-white/10">
                {orders.map((order) => (
                  <article key={order.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_140px_150px_180px_120px_130px] lg:items-center">
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
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-4 text-caption-strong text-black transition hover:bg-white/85 lg:justify-self-end"
                    >
                      <span aria-hidden="true">👁</span>
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
            <div className="hidden grid-cols-[1fr_150px_150px_180px_130px] gap-4 border-b border-white/10 px-5 py-4 text-caption-strong text-white/55 lg:grid">
              <span>รายการ</span>
              <span>จำนวนเงิน</span>
              <span>Point</span>
              <span>เวลา</span>
              <span className="text-right">สถานะ</span>
            </div>

            <div className="divide-y divide-white/10">
              {topups.map((topup) => (
                <article key={topup.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_150px_150px_180px_130px] lg:items-center">
                  <div className="min-w-0">
                    <p className="text-body-strong truncate text-white">เติม Point</p>
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
        >
          <div
            className="w-full max-w-lg rounded-[1.5rem] border border-white/14 bg-[#0b0b0b] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-caption text-white/55">{selectedOrder.gameMap}</p>
                <h2 id="order-code-title" className="text-tagline mt-1 truncate text-white">
                  {selectedOrder.productName}
                </h2>
                <p className="text-caption mt-2 text-white/55">รหัสนี้เป็นข้อมูลส่วนตัวของคุณ</p>
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

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black px-4 py-3">
                <p className="text-fine-print text-white/45">ID</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-body-strong break-all text-white">{selectedOrder.gameAccountId}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy("id", selectedOrder.gameAccountId)}
                    className="btn-pill-ghost shrink-0 px-4 py-2 text-caption text-white"
                  >
                    {idCopyState === "copied" ? "คัดลอกแล้ว" : idCopyState === "failed" ? "คัดลอกไม่สำเร็จ" : "คัดลอก ID"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black px-4 py-3">
                <p className="text-fine-print text-white/45">Password</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-body-strong break-all text-white">{selectedOrder.gamePassword}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy("password", selectedOrder.gamePassword)}
                    className="btn-pill-ghost shrink-0 px-4 py-2 text-caption text-white"
                  >
                    {passwordCopyState === "copied" ? "คัดลอกแล้ว" : passwordCopyState === "failed" ? "คัดลอกไม่สำเร็จ" : "คัดลอก Password"}
                  </button>
                </div>
              </div>
            </div>

            <button type="button" onClick={closeCode} className="btn-pill mt-5 w-full px-5 py-3 text-caption">
              ปิด
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
