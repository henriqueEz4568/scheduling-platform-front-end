import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.local", ".env.development", ".env.production", ".env"];
const RELEASE_LINE =
  /^\s*(?:export\s+)?(?:NODE_ENV|NEXT_PUBLIC_APP_ENV)\s*=\s*["']?release["']?\s*(?:#.*)?$/m;

/**
 * Used by next.config.ts only (Node). Next sets NODE_ENV itself before
 * loading .env files, so `NODE_ENV=release` written in a .env file never
 * reaches process.env; this reads the files directly instead.
 */
export function isReleaseEnabled(
  dir: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NEXT_PUBLIC_APP_ENV === "release" || env.NODE_ENV === "release") {
    return true;
  }

  return ENV_FILES.some((file) => {
    try {
      return RELEASE_LINE.test(fs.readFileSync(path.join(dir, file), "utf8"));
    } catch {
      return false;
    }
  });
}
