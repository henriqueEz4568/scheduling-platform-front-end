import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  formatCurrency,
  formatDateTime,
  resolveLocale,
  translate,
  translateMessage,
} from "@/i18n/translate";
import type { UseTranslationResult } from "@/types/i18n";

/** Current language (from Next.js i18n routing) and its helpers. */
export function useTranslation(): UseTranslationResult {
  const { locale: routerLocale } = useRouter();
  const locale = resolveLocale(routerLocale);

  return useMemo(
    () => ({
      locale,
      t: (key, vars) => translate(locale, key, vars),
      tm: (text, vars) => (text ? translateMessage(locale, text, vars) : ""),
      formatCurrency: (value) => formatCurrency(locale, value),
      formatDateTime: (value) => formatDateTime(locale, value),
    }),
    [locale],
  );
}
