import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createProxyHandler,
  mapBackendError,
} from "@/lib/server/proxy-handler";
import {
  backendError,
  backendResponse,
  callHandler,
  networkError,
} from "../../helpers/next-api";
import { createJwt, secondsFromNow } from "../../helpers/jwt";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@/lib/server/api-client", () => ({
  getApiClient: () => ({ request }),
}));

const handler = createProxyHandler({
  GET: {
    path: "/things",
    forwardQuery: true,
    errorMessage: "Unable to load things.",
  },
  POST: {
    path: "/things",
    bodySchema: z.object({ name: z.string().min(1, "Name is required.") }),
    errorMessage: "Unable to create thing.",
  },
});

const validToken = createJwt({ sub: "1", exp: secondsFromNow(3600) });
const authCookie = { token: validToken };

describe("createProxyHandler", () => {
  beforeEach(() => {
    request.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("answers 405 with an Allow header for methods without a route", async () => {
    const res = await callHandler(handler, {
      method: "DELETE",
      cookies: authCookie,
    });

    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe("GET, POST");
    expect(res.body).toEqual({ success: false, message: "Method not allowed" });
    expect(request).not.toHaveBeenCalled();
  });

  it("answers 401 without a token and never calls the backend", async () => {
    const res = await callHandler(handler, { method: "GET" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Authentication token not provided.",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("answers 401 for an expired JWT", async () => {
    const res = await callHandler(handler, {
      method: "GET",
      cookies: { token: createJwt({ exp: secondsFromNow(-60) }) },
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Session expired." });
    expect(request).not.toHaveBeenCalled();
  });

  it("forwards the cookie token as a Bearer header and returns the backend response", async () => {
    request.mockResolvedValue(backendResponse(200, { things: [1, 2] }));

    const res = await callHandler(handler, {
      method: "GET",
      cookies: authCookie,
      query: { page: "2" },
    });

    expect(request).toHaveBeenCalledWith({
      method: "GET",
      url: "/things",
      data: undefined,
      params: { page: "2" },
      headers: { Authorization: `Bearer ${validToken}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ things: [1, 2] });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("accepts the token from the Authorization header", async () => {
    request.mockResolvedValue(backendResponse(200, {}));

    const res = await callHandler(handler, {
      method: "GET",
      headers: { authorization: `Bearer ${validToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(request.mock.calls[0][0].headers).toEqual({
      Authorization: `Bearer ${validToken}`,
    });
  });

  it.each([400, 401, 403, 404, 409, 422])(
    "preserves backend status %i and its message",
    async (status) => {
      request.mockRejectedValue(
        backendError(status, { message: `backend says ${status}` }),
      );

      const res = await callHandler(handler, {
        method: "GET",
        cookies: authCookie,
      });

      expect(res.statusCode).toBe(status);
      expect(res.body).toEqual({
        success: false,
        message: `backend says ${status}`,
      });
    },
  );

  it("preserves backend 5xx status but hides the backend message", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    request.mockRejectedValue(
      backendError(503, { message: "db connection refused at 10.0.0.3" }),
    );

    const res = await callHandler(handler, {
      method: "GET",
      cookies: authCookie,
    });

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      success: false,
      message: "Unable to load things.",
    });
  });

  it("answers 502 when the backend is unreachable and 504 on timeout", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    request.mockRejectedValueOnce(networkError("ECONNREFUSED"));
    const unreachable = await callHandler(handler, {
      method: "GET",
      cookies: authCookie,
    });

    request.mockRejectedValueOnce(networkError("ECONNABORTED"));
    const timedOut = await callHandler(handler, {
      method: "GET",
      cookies: authCookie,
    });

    expect(unreachable.statusCode).toBe(502);
    expect(timedOut.statusCode).toBe(504);
  });

  it("answers 400 with the schema message for an invalid body", async () => {
    const res = await callHandler(handler, {
      method: "POST",
      cookies: authCookie,
      body: { name: "" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Name is required." });
    expect(request).not.toHaveBeenCalled();
  });

  it("forwards only the parsed body fields", async () => {
    request.mockResolvedValue(backendResponse(201, { id: "t1" }));

    const res = await callHandler(handler, {
      method: "POST",
      cookies: authCookie,
      body: { name: "Thing", ownerId: "someone-else" },
    });

    expect(request.mock.calls[0][0].data).toEqual({ name: "Thing" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: "t1" });
  });
});

describe("mapBackendError", () => {
  it("uses the override message for a configured status", () => {
    expect(
      mapBackendError(backendError(401, { message: "Unauthorized" }), {
        fallbackMessage: "fallback",
        statusMessages: { 401: "Invalid email or password." },
      }),
    ).toEqual({ status: 401, message: "Invalid email or password." });
  });

  it("falls back to 500 for non-axios errors", () => {
    expect(
      mapBackendError(new Error("boom"), { fallbackMessage: "fallback" }),
    ).toEqual({ status: 500, message: "fallback" });
  });

  it("uses the fallback when the backend sends no message", () => {
    expect(
      mapBackendError(backendError(404, "Not Found"), {
        fallbackMessage: "fallback",
      }),
    ).toEqual({ status: 404, message: "fallback" });
  });
});
