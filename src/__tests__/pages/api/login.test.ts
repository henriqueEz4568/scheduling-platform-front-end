import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "@/pages/api/login";
import {
  backendError,
  backendResponse,
  callHandler,
  networkError,
} from "../../helpers/next-api";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/lib/server/api-client", () => ({
  getApiClient: () => ({ post }),
}));

const credentials = { email: "maria@example.com", password: "Wrong-Pass-123" };

describe("POST /api/login", () => {
  beforeEach(() => {
    post.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("answers 405 for other methods", async () => {
    const res = await callHandler(handler, { method: "GET" });

    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe("POST");
  });

  it("maps a backend 401 to 401 with a readable message (not 500)", async () => {
    post.mockRejectedValue(backendError(401, { message: "Unauthorized" }));

    const res = await callHandler(handler, {
      method: "POST",
      body: credentials,
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid email or password.",
    });
    expect(res.headers["set-cookie"]).toBeUndefined();
  });

  it("answers 401 when the backend reports success: false", async () => {
    post.mockResolvedValue(
      backendResponse(200, { success: false, message: "Account locked." }),
    );

    const res = await callHandler(handler, {
      method: "POST",
      body: credentials,
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Account locked." });
  });

  it("sets the httpOnly token cookie on success", async () => {
    const user = { id: "u1", name: "Maria", email: credentials.email };
    post.mockResolvedValue(
      backendResponse(200, { success: true, token: "jwt-token", user }),
    );

    const res = await callHandler(handler, {
      method: "POST",
      body: credentials,
    });

    expect(post).toHaveBeenCalledWith("/auth/login", credentials);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Login OK", user });
    expect(res.headers["set-cookie"]).toMatch(/^token=jwt-token;/);
    expect(res.headers["set-cookie"]).toMatch(/HttpOnly/);
    expect(res.headers["set-cookie"]).toMatch(/SameSite=Lax/);
  });

  it("answers 502 without leaking the request (password) to logs when the backend is down", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    post.mockRejectedValue(networkError());

    const res = await callHandler(handler, {
      method: "POST",
      body: credentials,
    });

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({
      success: false,
      message: "Unable to sign in right now. Please try again.",
    });
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(
      credentials.password,
    );
  });
});
