import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { hasActiveSession } from "@/lib/auth/session";
import { createJwt, secondsFromNow } from "../../helpers/jwt";

const now = Date.UTC(2026, 9, 14, 12, 0, 0);

describe("decodeJwtPayload", () => {
  it("decodes a base64url payload, including UTF-8 text", () => {
    const token = createJwt({ sub: "1", name: "João Ação", exp: 1 });

    expect(decodeJwtPayload(token)).toEqual({
      sub: "1",
      name: "João Ação",
      exp: 1,
    });
  });

  it.each([
    ["an empty string", ""],
    ["an opaque token", "opaque-session-id"],
    ["two segments", "a.b"],
    ["a non-JSON payload", "a.bm90LWpzb24.c"],
    ["a JSON array payload", `a.${Buffer.from("[1]").toString("base64url")}.c`],
    ["an empty payload segment", "a..c"],
  ])("returns null for %s", (_label, token) => {
    expect(decodeJwtPayload(token)).toBeNull();
  });
});

describe("isJwtExpired", () => {
  it("is true when exp is in the past", () => {
    expect(isJwtExpired(createJwt({ exp: secondsFromNow(-1, now) }), now)).toBe(
      true,
    );
  });

  it("is true exactly at exp", () => {
    expect(isJwtExpired(createJwt({ exp: now / 1000 }), now)).toBe(true);
  });

  it("is false when exp is in the future", () => {
    expect(
      isJwtExpired(createJwt({ exp: secondsFromNow(60, now) }), now),
    ).toBe(false);
  });

  it.each([
    ["no exp", createJwt({ sub: "1" })],
    ["a non-numeric exp", createJwt({ exp: "soon" })],
    ["an undecodable token", "opaque-session-id"],
  ])("is false for %s (left for the backend to judge)", (_label, token) => {
    expect(isJwtExpired(token, now)).toBe(false);
  });
});

describe("hasActiveSession", () => {
  it("requires a non-empty token", () => {
    expect(hasActiveSession(undefined, now)).toBe(false);
    expect(hasActiveSession(null, now)).toBe(false);
    expect(hasActiveSession("", now)).toBe(false);
  });

  it("rejects expired JWTs and accepts the rest", () => {
    expect(
      hasActiveSession(createJwt({ exp: secondsFromNow(-60, now) }), now),
    ).toBe(false);
    expect(
      hasActiveSession(createJwt({ exp: secondsFromNow(60, now) }), now),
    ).toBe(true);
    expect(hasActiveSession("opaque-session-id", now)).toBe(true);
  });
});
