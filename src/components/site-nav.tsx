import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { AnnouncementBar } from "@/components/announcement-bar";

export async function SiteNav() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <>
      {/* ── Global Nav (black bar) ── */}
      <nav className="global-nav" aria-label="Global navigation">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          translate="no"
        >
          <Image
            src="/logo.png"
            alt="Cozin logo"
            width={30}
            height={20}
            className="rounded-sm"
            priority
          />
          <span className="text-nav-link font-semibold tracking-wide uppercase">
            Cozin
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-5 sm:flex">
          <Link href="/products" className="text-nav-link">
            Products
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/topup" className="text-nav-link">
                Top Up
              </Link>
              <Link href="/orders" className="text-nav-link">
                History
              </Link>
              <Link
                href="/account"
                className="text-nav-link rounded-full bg-white/10 px-3 py-1.5 opacity-100 transition-colors hover:bg-white/20"
              >
                Account
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-nav-link">
                Login
              </Link>
              <Link
                href="/register"
                className="text-nav-link rounded-full bg-[var(--primary)] px-3 py-1.5 opacity-100 transition-colors hover:bg-[var(--primary-focus)]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger (zero-JS disclosure) */}
        <details className="relative sm:hidden">
          <summary
            className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-white/10 list-none [&::-webkit-details-marker]:hidden"
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1h16M1 7h16M1 13h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--surface-tile-2)] p-2 shadow-lg">
            <Link
              href="/products"
              className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
            >
              Products
            </Link>
            {isSignedIn ? (
              <>
                <Link
                  href="/topup"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  Top Up
                </Link>
                <Link
                  href="/orders"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  History
                </Link>
                <Link
                  href="/account"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-3 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </details>
      </nav>

      {/* ── Announcement Bar ── */}
      <AnnouncementBar />
    </>
  );
}
