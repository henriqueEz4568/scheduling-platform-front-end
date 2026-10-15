import axios, { isAxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isJwtExpired } from "@/lib/auth/jwt";
import { isMock, mockAdapter } from "@/mock";

const api = axios.create({ baseURL: "http://mock.local/", adapter: mockAdapter });

describe("isMock", () => {
  it("only turns on with the exact value 'release'", () => {
    expect(isMock({})).toBe(false);
    expect(isMock({ NODE_ENV: "production" })).toBe(false);
    expect(isMock({ NEXT_PUBLIC_APP_ENV: "Release" })).toBe(false);
    expect(isMock({ NEXT_PUBLIC_APP_ENV: "release" })).toBe(true);
    expect(isMock({ NODE_ENV: "release" })).toBe(true);
  });
});

describe("mockAdapter", () => {
  it("login accepts any credentials and returns a JWT-shaped token", async () => {
    const { status, data } = await api.post("/auth/login", {
      email: "qualquer@exemplo.com",
      password: "x",
    });

    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toMatchObject({ email: "qualquer@exemplo.com", role: "admin" });
    expect(decodeJwtPayload(data.token)?.exp).toEqual(expect.any(Number));
    expect(isJwtExpired(data.token)).toBe(false);
  });

  it("a service created with POST /services shows up in GET /services", async () => {
    const { status, data: created } = await api.post("/services", {
      name: "Hidratação",
      duration: 40,
      price: 70,
    });
    const { data } = await api.get("/services");

    expect(status).toBe(201);
    expect(data.services).toContainEqual(
      expect.objectContaining({ id: created.id, name: "Hidratação" }),
    );
  });

  it("paginates GET /bookings", async () => {
    const { data } = await api.get("/bookings", { params: { page: 2, limit: 5 } });

    expect(data.totalRows).toBeGreaterThanOrEqual(8);
    expect(data.totalPages).toBe(Math.ceil(data.totalRows / 5));
    expect(data.bookings.length).toBe(data.totalRows - 5);
  });

  it("rejects unmapped routes with a 404 AxiosError", async () => {
    const error = await api.delete("/customers/1").catch((e: unknown) => e);

    expect(isAxiosError(error)).toBe(true);
    expect(isAxiosError(error) && error.response?.status).toBe(404);
    expect(isAxiosError(error) && error.message).toBe(
      "Rota não mockada: DELETE /customers/1",
    );
  });
});
