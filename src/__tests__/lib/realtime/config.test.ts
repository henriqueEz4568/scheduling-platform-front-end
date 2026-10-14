import { describe, expect, it } from "vitest";
import { parseRealtimeConfig } from "@/lib/realtime/config";

describe("parseRealtimeConfig", () => {
  it.each([undefined, "", "false", "1", "TRUE"])(
    "is disabled when NEXT_PUBLIC_REALTIME_ENABLED is %s",
    (enabled) => {
      expect(
        parseRealtimeConfig({ enabled, url: "https://realtime.example.com" }),
      ).toEqual({ enabled: false, reason: "disabled" });
    },
  );

  it("is disabled without a URL", () => {
    expect(parseRealtimeConfig({ enabled: "true" })).toEqual({
      enabled: false,
      reason: "missing-url",
    });
    expect(parseRealtimeConfig({ enabled: "true", url: "  " })).toEqual({
      enabled: false,
      reason: "missing-url",
    });
  });

  it.each(["undefined", "realtime.example.com", "ftp://realtime.example.com"])(
    "is disabled with an invalid URL (%s)",
    (url) => {
      expect(parseRealtimeConfig({ enabled: "true", url })).toEqual({
        enabled: false,
        reason: "invalid-url",
      });
    },
  );

  it.each([
    "http://localhost:3333",
    "https://realtime.example.com",
    "wss://realtime.example.com/socket",
  ])("is enabled with %s", (url) => {
    expect(parseRealtimeConfig({ enabled: "true", url })).toEqual({
      enabled: true,
      url,
    });
  });
});
