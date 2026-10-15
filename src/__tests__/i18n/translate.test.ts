import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import en from "@/i18n/messages/en";
import es from "@/i18n/messages/es";
import ptBR from "@/i18n/messages/pt-BR";
import {
  formatCurrency,
  formatDateTime,
  resolveLocale,
  translate,
  translateMessage,
} from "@/i18n/translate";
import { createBookingSchema } from "@/lib/schemas/booking";
import { loginSchema } from "@/lib/schemas/login";
import { registerSchema } from "@/lib/schemas/register";
import { createServiceSchema } from "@/lib/schemas/service";

/** Every "a.b.c" path that leads to a string. */
function keysOf(node: object, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${prefix}${key}`]
      : keysOf(value as object, `${prefix}${key}.`),
  );
}

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe("dictionaries", () => {
  const ptKeys = keysOf(ptBR).sort();

  it.each([
    ["en", en],
    ["es", es],
  ])("%s has exactly the same keys as pt-BR", (_locale, messages) => {
    expect(keysOf(messages).sort()).toEqual(ptKeys);
  });

  it.each(LOCALES)("%s has no empty texts and keeps every placeholder", (locale) => {
    for (const key of ptKeys) {
      const text = translateMessage(locale, key);
      expect(text.trim(), `${locale}: ${key}`).not.toBe("");
      expect(placeholders(text), `${locale}: ${key}`).toEqual(
        placeholders(translateMessage(DEFAULT_LOCALE, key)),
      );
    }
  });
});

describe("translate", () => {
  it("translates by locale and fills the variables", () => {
    expect(translate("pt-BR", "dashboard.welcome", { name: "Ana" })).toBe(
      "Bem-vindo de volta, Ana!",
    );
    expect(translate("en", "dashboard.welcome", { name: "Ana" })).toBe(
      "Welcome back, Ana!",
    );
    expect(translate("es", "dashboard.welcome", { name: "Ana" })).toBe(
      "¡Bienvenido de nuevo, Ana!",
    );
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", "dashboard.welcome")).toBe("Welcome back, {name}!");
  });

  it("falls back to pt-BR for an unsupported locale", () => {
    expect(resolveLocale("fr")).toBe("pt-BR");
    expect(resolveLocale(undefined)).toBe("pt-BR");
    expect(resolveLocale("es")).toBe("es");
  });
});

describe("translateMessage", () => {
  it("translates keys and passes any other text through", () => {
    expect(translateMessage("en", "validation.emailInvalid")).toBe("Invalid email.");
    expect(translateMessage("es", "Email already registered.")).toBe(
      "Email already registered.",
    );
    expect(translateMessage("en", "status.unknown")).toBe("status.unknown");
  });
});

describe("schema messages", () => {
  const issues = [
    ...(loginSchema.safeParse({ email: "x", password: "" }).error?.issues ?? []),
    ...(registerSchema.safeParse({
      name: "",
      email: "x",
      password: "weak",
      confirmPassword: "",
    }).error?.issues ?? []),
    ...(createBookingSchema.safeParse({ start: "x", end: "y", serviceId: "" })
      .error?.issues ?? []),
    ...(createServiceSchema.safeParse({ name: "", duration: 0, price: -1 })
      .error?.issues ?? []),
  ];

  it("are translation keys that exist in every language", () => {
    expect(issues.length).toBeGreaterThan(5);
    for (const { message } of issues) {
      expect(message).toMatch(/^validation\./);
      for (const locale of LOCALES) {
        expect(translateMessage(locale, message), `${locale}: ${message}`).not.toBe(
          message,
        );
      }
    }
  });
});

describe("formatters", () => {
  it("format reais following the language", () => {
    expect(formatCurrency("pt-BR", 50)).toMatch(/^R\$\s50,00$/);
    expect(formatCurrency("en", 50)).toBe("R$50.00");
    expect(formatCurrency("es", 50)).toMatch(/^50,00\sR\$$/);
    expect(formatCurrency("en", null)).toBe("-");
  });

  it("format dates following the language", () => {
    const date = new Date(2026, 9, 20, 14, 30);

    expect(formatDateTime("pt-BR", date)).toContain("20/10/2026");
    expect(formatDateTime("en", date)).toContain("10/20/26");
    expect(formatDateTime("es", date)).toContain("20/10/26");
    expect(formatDateTime("es", "not a date")).toBe("-");
  });
});
