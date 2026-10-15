import type { NextConfig } from "next";
import { DEFAULT_LOCALE, LOCALES } from "./src/i18n/config";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // pt-BR has no prefix (/dashboard); English and Spanish use /en and /es.
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
  },
};

export default nextConfig;
