import { useRouter } from "next/router";
import { Languages } from "lucide-react";
import { LOCALE_COOKIE, LOCALES, isLocale } from "@/i18n/config";
import { useTranslation } from "@/i18n/use-translation";
import { cn } from "@/lib/utils";
import type { LanguageSwitcherProps } from "@/types/i18n";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, t } = useTranslation();

  const changeLocale = (nextLocale: string) => {
    if (!isLocale(nextLocale) || nextLocale === locale) {
      return;
    }

    // Next.js reads this cookie to open "/" in the chosen language later.
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
      locale: nextLocale,
    });
  };

  return (
    <label className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Languages className="hidden h-4 w-4 sm:block" aria-hidden="true" />
      <select
        aria-label={t("common.language")}
        value={locale}
        onChange={(event) => changeLocale(event.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option} lang={option}>
            {t(`languages.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
