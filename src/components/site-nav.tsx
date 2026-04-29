import { Gamepad2 } from "lucide-react";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export async function SiteNav() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <nav className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Gamepad2 className="size-5" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">Cozin</p>
          <p className="text-sm text-muted-foreground">Roblox Code Shop</p>
        </div>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/products">Products</Link>
        </Button>
        {isSignedIn ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/topup">Top up</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/orders">Purchase history</Link>
            </Button>
            <Button asChild>
              <Link href="/account">Account</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
