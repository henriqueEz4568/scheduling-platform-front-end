import { isMockClient } from "@/mock";
import type { RealtimeConfig, RealtimeConfigInput } from "@/types/realtime";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "ws:", "wss:"]);

export function parseRealtimeConfig({
  enabled,
  url,
}: RealtimeConfigInput): RealtimeConfig {
  if (enabled?.trim() !== "true") {
    return { enabled: false, reason: "disabled" };
  }

  const trimmedUrl = url?.trim();
  if (!trimmedUrl) {
    return { enabled: false, reason: "missing-url" };
  }

  try {
    const { protocol } = new URL(trimmedUrl);
    if (!ALLOWED_PROTOCOLS.has(protocol)) {
      return { enabled: false, reason: "invalid-url" };
    }
  } catch {
    return { enabled: false, reason: "invalid-url" };
  }

  return { enabled: true, url: trimmedUrl };
}

export function getRealtimeConfig(): RealtimeConfig {
  // Release mode has no backend: never open the socket (no bell counter).
  if (isMockClient()) {
    return { enabled: false, reason: "disabled" };
  }

  // NEXT_PUBLIC_* values are inlined at build time, so they must be read
  // with these literal property accesses.
  return parseRealtimeConfig({
    enabled: process.env.NEXT_PUBLIC_REALTIME_ENABLED,
    url: process.env.NEXT_PUBLIC_REALTIME_URL,
  });
}
