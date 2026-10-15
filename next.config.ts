import type { NextConfig } from "next";
import { isReleaseEnabled } from "./src/mock/release-env";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Release mode (src/mock): NEXT_PUBLIC_APP_ENV=release or NODE_ENV=release,
  // in the shell or in a .env file, is inlined for the server and the browser.
  ...(isReleaseEnabled(process.cwd())
    ? { env: { NEXT_PUBLIC_APP_ENV: "release" } }
    : {}),
};

export default nextConfig;
