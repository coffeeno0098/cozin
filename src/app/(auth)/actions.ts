"use server";

import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { loginSchema, registerSchema } from "@/lib/auth/validation";
import { buildRateLimitKey, checkRateLimit, rateLimitWindows } from "@/lib/rate-limit";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function loginAction(formData: FormData) {
  const username = getString(formData, "username");
  const password = getString(formData, "password");
  const rateLimitKey = await buildRateLimitKey("login", username || "anonymous");
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitWindows.login);

  if (!rateLimit.allowed) {
    redirect("/login?error=rate-limit");
  }

  const parsed = loginSchema.safeParse({
    username,
    password,
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  try {
    await signIn("credentials", {
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      redirect("/login?error=credentials");
    }

    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const rawUsername = getString(formData, "username");
  const rateLimitKey = await buildRateLimitKey("register", rawUsername || "anonymous");
  const rateLimit = checkRateLimit(rateLimitKey, rateLimitWindows.register);

  if (!rateLimit.allowed) {
    redirect("/register?error=rate-limit");
  }

  const parsed = registerSchema.safeParse({
    username: rawUsername,
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    confirmPassword: getString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/register?error=invalid");
  }

  const { username, email, password } = parsed.data;

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(email ? or(eq(users.username, username), eq(users.email, email)) : eq(users.username, username))
    .limit(1);

  if (existingUser) {
    redirect("/register?error=duplicate");
  }

  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    username,
    name: username,
    email: email ?? null,
    passwordHash,
  });

  redirect("/login?registered=1");
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
