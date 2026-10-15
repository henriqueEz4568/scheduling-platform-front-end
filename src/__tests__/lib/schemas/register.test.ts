import { describe, expect, it } from "vitest";
import { registerSchema, signUpPayloadSchema } from "@/lib/schemas/register";

const validForm = {
  name: "Maria Silva",
  email: "maria@example.com",
  password: "Senha1234",
  confirmPassword: "Senha1234",
};

describe("registerSchema", () => {
  it("accepts a valid form", () => {
    expect(registerSchema.safeParse(validForm).success).toBe(true);
  });

  it.each(["admin", "user", "superadmin"])(
    "rejects a role coming from the client (%s)",
    (role) => {
      const result = registerSchema.safeParse({ ...validForm, role });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]).toMatchObject({
        code: "unrecognized_keys",
        keys: ["role"],
      });
    },
  );

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validForm,
      confirmPassword: "Outra1234",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ["confirmPassword"],
      message: "validation.passwordMismatch",
    });
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      ...validForm,
      password: "senha",
      confirmPassword: "senha",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "validation.passwordMin",
    );
  });
});

describe("signUpPayloadSchema", () => {
  it("strips a role sent by the client", () => {
    const result = signUpPayloadSchema.safeParse({
      name: " Maria Silva ",
      email: "maria@example.com",
      password: "Senha1234",
      role: "admin",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "Senha1234",
    });
    expect(result.data).not.toHaveProperty("role");
  });

  it("rejects an invalid email", () => {
    const result = signUpPayloadSchema.safeParse({
      name: "Maria",
      email: "not-an-email",
      password: "Senha1234",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("validation.emailInvalid");
  });
});
