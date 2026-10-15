export const LOCALES = ["pt-BR", "en", "es"] as const;

export const DEFAULT_LOCALE = "pt-BR";

/** Cookie Next.js reads to remember the chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is (typeof LOCALES)[number] {
  return (LOCALES as readonly unknown[]).includes(value);
}
