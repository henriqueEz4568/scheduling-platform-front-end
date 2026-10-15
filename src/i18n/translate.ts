import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import en from "@/i18n/messages/en";
import es from "@/i18n/messages/es";
import ptBR from "@/i18n/messages/pt-BR";
import type {
  Locale,
  MessageKey,
  Messages,
  TranslationVars,
} from "@/types/i18n";

const dictionaries: Record<Locale, Messages> = { "pt-BR": ptBR, en, es };

/**
 * Marks a string as a translation key. Used by the zod schemas, which are
 * shared with the BFF, so their messages are translated on screen.
 */
export function messageKey(key: MessageKey): MessageKey {
  return key;
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function lookup(locale: Locale, key: string): string | undefined {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") {
      return undefined;
    }
    node = (node as Record<string, unknown>)[part];
  }

  return typeof node === "string" ? node : undefined;
}

function interpolate(text: string, vars?: TranslationVars): string {
  if (!vars) {
    return text;
  }

  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: TranslationVars,
): string {
  return interpolate(lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key, vars);
}

/** Translates `text` when it is a key; otherwise returns it as is. */
export function translateMessage(
  locale: Locale,
  text: string,
  vars?: TranslationVars,
): string {
  const message = lookup(locale, text) ?? lookup(DEFAULT_LOCALE, text);
  return message ? interpolate(message, vars) : text;
}

export function formatCurrency(locale: Locale, value?: number | null): string {
  if (typeof value !== "number") {
    return "-";
  }

  // Prices are always in reais; only the formatting follows the language.
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    currencyDisplay: "narrowSymbol",
  }).format(value);
}

export function formatDateTime(
  locale: Locale,
  value?: string | Date | null,
): string {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
