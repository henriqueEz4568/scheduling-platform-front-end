/**
 * Browser-safe check (banner, socket). Only NEXT_PUBLIC_NODE_ENV is reliable
 * there, and it must be a literal access so Next inlines it at build time.
 * Kept apart from ./index so the browser never bundles the mock adapter.
 */
export function isMockClient(): boolean {
  return process.env.NEXT_PUBLIC_NODE_ENV === "release";
}
