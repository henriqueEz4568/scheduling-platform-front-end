import { isJwtExpired } from "@/lib/auth/jwt";

export const AUTH_COOKIE_NAME = "token";

/**
 * A session cookie is usable when it exists and is not a decodable JWT that
 * has already expired. Edge-safe (used by the middleware).
 */
export function hasActiveSession(
  token: string | null | undefined,
  now: number = Date.now(),
): token is string {
  return typeof token === "string" && token !== "" && !isJwtExpired(token, now);
}
