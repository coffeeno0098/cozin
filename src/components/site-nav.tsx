import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AnnouncementBar } from "@/components/announcement-bar";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function SiteNav() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const accountLabel = session?.user?.name || "Account";
  const [currentUser] = session?.user?.id
    ? await db
        .select({
          points: users.points,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
    : [];
  const pointBalance = currentUser?.points ?? 0;
  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <nav className="global-nav" aria-label="Global navigation">
        <Link href="/" className="nav-brand" translate="no">
          <Image
            src="/logomain.png"
            alt="Cozin logo"
            width={96}
            height={32}
            className="nav-brand-logo"
            priority
          />
          <span className="nav-brand-text">Cozin</span>
        </Link>

        <div className="nav-center">
          <Link href="/" className="nav-link-pill">
            หน้าแรก
          </Link>
          <Link href="/products" className="nav-link-pill">
            สินค้าทั้งหมด
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/topup" className="nav-link-pill">
                Top Up
              </Link>
              <Link href="/orders" className="nav-link-pill">
                ประวัติการซื้อ
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="nav-link-pill">
                  Admin
                </Link>
              ) : null}
            </>
          ) : (
            <Link href="/login" className="nav-link-pill">
              Login
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
              <Link href="/topup" className="nav-point-balance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#a78bfa" }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {pointBalance} Point
              </Link>
              <Link href="/account" className="nav-action-primary">
                {accountLabel}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-action-secondary">
                Login
              </Link>
              <Link href="/register" className="nav-action-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <details className="nav-mobile-menu">
          <summary className="nav-mobile-trigger" aria-label="Toggle menu">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <path
                d="M1 1h16M1 7h16M1 13h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div className="nav-mobile-panel">
            <Link href="/" className="nav-mobile-link">
              หน้าแรก
            </Link>
            <Link href="/products" className="nav-mobile-link">
              สินค้าทั้งหมด
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/topup" className="nav-mobile-link">
                  Top Up
                </Link>
                <Link href="/orders" className="nav-mobile-link">
                  ประวัติการซื้อ
                </Link>
                {isAdmin ? (
                  <Link href="/admin" className="nav-mobile-link">
                    Admin
                  </Link>
                ) : null}
                <Link href="/account" className="nav-mobile-link">
                  {accountLabel}
                </Link>
                <Link href="/topup" className="nav-mobile-link">
                  {pointBalance} Point
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-mobile-link">
                  Login
                </Link>
                <Link href="/register" className="nav-mobile-link">
                  Register
                </Link>
              </>
            )}
          </div>
        </details>
      </nav>

      <AnnouncementBar />
    </>
  );
}
