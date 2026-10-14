import type { JwtPayload } from "@/types/auth";

/**
 * Decodes the JWT payload WITHOUT verifying the signature. Only use it for
 * UX decisions (e.g. skipping a page for an obviously expired session); the
 * backend remains the authority on whether a token is valid.
 *
 * Edge-safe: relies only on atob, TextDecoder and JSON.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const segments = token.split(".");
  if (segments.length !== 3 || !segments[1]) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * True only when the token decodes and has a numeric `exp` (seconds) that is
 * not in the future. Opaque/undecodable tokens are left for the backend.
 */
export function isJwtExpired(token: string, now: number = Date.now()): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return false;
  }

  return exp * 1000 <= now;
}
