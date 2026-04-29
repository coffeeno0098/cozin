import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(32, "Username must be at most 32 characters.")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only use letters, numbers, and underscores.")
  .transform((value) => value.toLowerCase());

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("Email is invalid.").optional(),
);

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const registerSchema = loginSchema
  .extend({
    email: optionalEmailSchema,
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
