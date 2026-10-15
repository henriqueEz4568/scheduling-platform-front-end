import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    // Next.js fills `lang` with the current i18n locale.
    <Html>
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
