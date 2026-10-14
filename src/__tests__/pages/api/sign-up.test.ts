import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "@/pages/api/sign-up";
import { getSignupRole } from "@/lib/server/signup-role";
import {
  backendError,
  backendResponse,
  callHandler,
} from "../../helpers/next-api";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/lib/server/api-client", () => ({
  getApiClient: () => ({ post }),
}));

const signUpBody = {
  name: "Maria Silva",
  email: "maria@example.com",
  password: "Senha1234",
};

describe("POST /api/sign-up", () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue(
      backendResponse(201, { success: true, user: { id: "u1" } }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never forwards a role sent by the browser", async () => {
    const res = await callHandler(handler, {
      method: "POST",
      body: { ...signUpBody, role: "superadmin", isAdmin: true },
    });

    expect(res.statusCode).toBe(201);
    expect(post).toHaveBeenCalledWith("/auth/sign_up", {
      ...signUpBody,
      role: "admin",
    });
  });

  it("uses SIGNUP_DEFAULT_ROLE from the server environment", async () => {
    vi.stubEnv("SIGNUP_DEFAULT_ROLE", "owner");

    await callHandler(handler, {
      method: "POST",
      body: { ...signUpBody, role: "admin" },
    });

    expect(post.mock.calls[0][1].role).toBe("owner");
  });

  it("answers 400 for an invalid body without calling the backend", async () => {
    const res = await callHandler(handler, {
      method: "POST",
      body: { ...signUpBody, email: "nope" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Email invalido." });
    expect(post).not.toHaveBeenCalled();
  });

  it("preserves the backend status and message", async () => {
    post.mockRejectedValue(
      backendError(409, { message: "Email already registered." }),
    );

    const res = await callHandler(handler, {
      method: "POST",
      body: signUpBody,
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "Email already registered.",
    });
  });
});

describe("getSignupRole", () => {
  it("defaults to admin and ignores blank values", () => {
    expect(getSignupRole({})).toBe("admin");
    expect(getSignupRole({ SIGNUP_DEFAULT_ROLE: "  " })).toBe("admin");
    expect(getSignupRole({ SIGNUP_DEFAULT_ROLE: " owner " })).toBe("owner");
  });
});
