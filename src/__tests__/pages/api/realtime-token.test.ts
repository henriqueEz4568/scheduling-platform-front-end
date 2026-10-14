import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "@/pages/api/realtime-token";
import { callHandler } from "../../helpers/next-api";
import { createJwt, secondsFromNow } from "../../helpers/jwt";

const validToken = createJwt({ sub: "1", exp: secondsFromNow(3600) });

function enableRealtime() {
  vi.stubEnv("NEXT_PUBLIC_REALTIME_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "https://realtime.example.com");
}

describe("GET /api/realtime-token", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_REALTIME_ENABLED", "");
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("answers 404 while realtime is disabled, even with a session", async () => {
    const res = await callHandler(handler, { cookies: { token: validToken } });

    expect(res.statusCode).toBe(404);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.body).not.toHaveProperty("token");
  });

  it("answers 404 while realtime is misconfigured", async () => {
    vi.stubEnv("NEXT_PUBLIC_REALTIME_ENABLED", "true");

    const res = await callHandler(handler, { cookies: { token: validToken } });

    expect(res.statusCode).toBe(404);
  });

  it("requires a session", async () => {
    enableRealtime();

    const res = await callHandler(handler);

    expect(res.statusCode).toBe(401);
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("rejects an expired session", async () => {
    enableRealtime();

    const res = await callHandler(handler, {
      cookies: { token: createJwt({ exp: secondsFromNow(-60) }) },
    });

    expect(res.statusCode).toBe(401);
  });

  it("only accepts GET", async () => {
    enableRealtime();

    const res = await callHandler(handler, {
      method: "POST",
      cookies: { token: validToken },
    });

    expect(res.statusCode).toBe(405);
  });

  it("returns the session token with Cache-Control: no-store", async () => {
    enableRealtime();

    const res = await callHandler(handler, { cookies: { token: validToken } });

    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.body).toEqual({ success: true, token: validToken });
  });
});
