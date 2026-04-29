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

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: getString(formData, "username"),
    password: getString(formData, "password"),
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
  const parsed = registerSchema.safeParse({
    username: getString(formData, "username"),
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
