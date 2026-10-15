import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, middleware } from "@/middleware";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/config";
import { createJwt, secondsFromNow } from "./helpers/jwt";

const validToken = createJwt({ sub: "1", exp: secondsFromNow(3600) });
const expiredToken = createJwt({ sub: "1", exp: secondsFromNow(-60) });

function run(path: string, token?: string) {
  const headers = token ? { cookie: `token=${token}` } : undefined;
  return middleware(new NextRequest(`http://localhost:3000${path}`, { headers }));
}

function redirectTarget(response: Response) {
  const location = response.headers.get("location");
  return location ? new URL(location).pathname : null;
}

describe("middleware", () => {
  it("covers /, /register and every /dashboard route", () => {
    expect(config.matcher).toEqual(["/", "/register", "/dashboard/:path*"]);
  });

  it.each(["/dashboard", "/dashboard/bookings", "/dashboard/new-service"])(
    "redirects %s to / without a token cookie",
    (path) => {
      const response = run(path);

      expect(response.status).toBe(307);
      expect(redirectTarget(response)).toBe("/");
    },
  );

  it("redirects to / and clears the cookie when the JWT expired", () => {
    const response = run("/dashboard", expiredToken);

    expect(redirectTarget(response)).toBe("/");
    const cleared = response.headers.get("set-cookie") ?? "";
    expect(cleared).toMatch(/^token=;/);
    expect(cleared).toMatch(/Max-Age=0/i);
    expect(cleared).toMatch(/Path=\//i);
  });

  it("drops the query string when redirecting", () => {
    expect(run("/dashboard/bookings?page=2").headers.get("location")).toBe(
      "http://localhost:3000/",
    );
  });

  it("lets a valid session through to /dashboard", () => {
    const response = run("/dashboard/bookings", validToken);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("lets an undecodable token through (the API answers 401 later)", () => {
    const response = run("/dashboard", "opaque-session-id");

    expect(response.headers.get("location")).toBeNull();
  });

  it.each(["/", "/register"])(
    "sends signed-in users from %s to /dashboard",
    (path) => {
      expect(redirectTarget(run(path, validToken))).toBe("/dashboard");
    },
  );

  it.each(["/", "/register"])("lets guests open %s", (path) => {
    const response = run(path);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("lets an expired session open / and clears the cookie", () => {
    const response = run("/", expiredToken);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toMatch(/^token=;/);
  });

  describe("with i18n routing", () => {
    const nextConfig = {
      i18n: { locales: [...LOCALES], defaultLocale: DEFAULT_LOCALE },
    };

    function runLocalized(path: string, token?: string) {
      const headers = token ? { cookie: `token=${token}` } : undefined;
      return middleware(
        new NextRequest(`http://localhost:3000${path}`, { headers, nextConfig }),
      );
    }

    it.each([
      ["/en/dashboard", "/en"],
      ["/es/dashboard/bookings", "/es"],
      ["/dashboard", "/"],
    ])("keeps the language when sending %s to the login", (path, target) => {
      expect(redirectTarget(runLocalized(path))).toBe(target);
    });

    it.each([
      ["/en/register", "/en/dashboard"],
      ["/es", "/es/dashboard"],
    ])("keeps the language when sending %s to the dashboard", (path, target) => {
      expect(redirectTarget(runLocalized(path, validToken))).toBe(target);
    });

    it("lets guests open a localized login", () => {
      expect(runLocalized("/en").headers.get("location")).toBeNull();
    });
  });
});
