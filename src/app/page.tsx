import { Coins, Gamepad2, History, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">Cozin</p>
              <p className="text-sm text-muted-foreground">Roblox Code Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild>
              <Link href="/register">สมัครสมาชิก</Link>
            </Button>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              เจ้าของร้านขายเอง ส่งรหัสอัตโนมัติหลังชำระ Point
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                ซื้อรหัส Roblox สำหรับ Blox Fruit และ Map ยอดนิยม
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                เติม Point ด้วยซอง TrueMoney แล้วใช้ Point ซื้อรหัสเกมได้ทันที
                ลูกค้าที่ไม่ได้ล็อกอินยังดูสินค้าได้ แต่ต้องสมัครสมาชิกก่อนซื้อ
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/login">
                <Coins className="size-4" />
                เติม Point
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                ดูสินค้า
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ตัวอย่างสินค้า</p>
                <h2 className="mt-2 text-2xl font-semibold">กัปตัน</h2>
                <p className="mt-1 text-sm text-muted-foreground">Map Blox Fruit</p>
              </div>
              <div className="rounded-md bg-secondary px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">ราคา</p>
                <p className="text-lg font-semibold">10 Point</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="mt-2 text-2xl font-semibold">10</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Rate</p>
                <p className="mt-2 text-2xl font-semibold">1:1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <Coins className="size-5" />
            <h3 className="mt-4 font-semibold">TrueMoney เป็น Point</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ลูกค้ากรอกลิงก์ซอง ระบบตรวจสอบแล้วแปลง 1 บาทเป็น 1 Point
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <LockKeyhole className="size-5" />
            <h3 className="mt-4 font-semibold">ส่งรหัสหลังซื้อ</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              เมื่อซื้อสำเร็จ รหัสจะถูกผูกกับ order และแสดง ID/Password ให้ดูย้อนหลัง
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <History className="size-5" />
            <h3 className="mt-4 font-semibold">ประวัติชัดเจน</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              เก็บประวัติเติมเงิน ซื้อสินค้า และการเปลี่ยนแปลง Point ทุกครั้ง
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
