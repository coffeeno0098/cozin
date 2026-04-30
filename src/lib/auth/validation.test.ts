import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/lib/auth/validation";

describe("auth validation", () => {
  it("normalizes usernames and accepts passwords with at least 6 characters", () => {
    const parsed = loginSchema.safeParse({
      username: "CoffeeNo",
      password: "123456",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe("coffeeno");
    }
  });

  it("rejects passwords shorter than 6 characters", () => {
    expect(
      registerSchema.safeParse({
        username: "coffeeno",
        email: "",
        password: "12345",
        confirmPassword: "12345",
      }).success,
    ).toBe(false);
  });
});
