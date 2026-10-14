import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "@/lib/server/api-client";

describe("resolveApiBaseUrl", () => {
  it("uses API_URL when set", () => {
    expect(
      resolveApiBaseUrl({
        API_URL: " https://api.example.com/ ",
        NODE_ENV: "production",
      }),
    ).toBe("https://api.example.com/");
  });

  it("falls back to localhost only in development", () => {
    expect(resolveApiBaseUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:3333/",
    );
  });

  it.each(["production", "test", undefined])(
    "throws a clear error when API_URL is missing (NODE_ENV=%s)",
    (nodeEnv) => {
      expect(() => resolveApiBaseUrl({ NODE_ENV: nodeEnv, API_URL: "" })).toThrow(
        /API_URL is not set/,
      );
    },
  );
});
