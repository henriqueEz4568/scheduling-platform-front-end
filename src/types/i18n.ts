import type { LOCALES } from "@/i18n/config";
import type ptBR from "@/i18n/messages/pt-BR";

export type Locale = (typeof LOCALES)[number];

/** Shape every dictionary must follow (pt-BR is the source of truth). */
export type Messages = typeof ptBR;

type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Dot-path of every translated string, e.g. "login.title". */
export type MessageKey = Leaves<Messages>;

export type TranslationVars = Record<string, string | number>;

export type UseTranslationResult = {
  locale: Locale;
  /** Translates a known key. */
  t: (key: MessageKey, vars?: TranslationVars) => string;
  /**
   * Translates text that may be a key (zod messages, API errors) and returns
   * it unchanged when it is not one.
   */
  tm: (text: string | null | undefined, vars?: TranslationVars) => string;
  formatCurrency: (value?: number | null) => string;
  formatDateTime: (value?: string | Date | null) => string;
};

export type LanguageSwitcherProps = {
  className?: string;
  /** "sidebar" for dark brand surfaces such as the app header. */
  variant?: "default" | "sidebar";
};
