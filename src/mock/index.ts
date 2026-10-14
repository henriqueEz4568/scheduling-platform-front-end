import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
} from "axios";

const RELEASE = "release";

/**
 * Release mode (fixed in-memory data, no backend). Only the exact value
 * "release" turns it on. Server only: NODE_ENV is read from the runtime
 * environment object because Next inlines `process.env.NODE_ENV` in bundles.
 */
export function isMock(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    isMockClient() ||
    env.NEXT_PUBLIC_APP_ENV === RELEASE ||
    env.NODE_ENV === RELEASE
  );
}

/**
 * Browser-safe check (banner, socket). Only NEXT_PUBLIC_APP_ENV is reliable
 * there, and it must be a literal access so Next inlines it at build time.
 */
export function isMockClient(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV === RELEASE;
}

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data !== "string") {
    return (data ?? {}) as Record<string, unknown>;
  }

  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * axios adapter used by the BFF in release mode: answers from src/mock
 * instead of the network. The routes (and the "accept any login" handler)
 * are loaded lazily, so they never load outside release mode.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  const { handleMockRoute } = await import("./routes");

  const method = (config.method ?? "get").toUpperCase();
  const path = new URL(config.url ?? "/", "http://mock.local").pathname.replace(
    /\/+$/,
    "",
  );
  const result = handleMockRoute(method, path, {
    body: parseBody(config.data),
    params: config.params ?? {},
  }) ?? {
    status: 404,
    data: { success: false, message: `Rota não mockada: ${method} ${path}` },
  };

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: String(result.status),
    headers: new AxiosHeaders(),
    config,
  };

  if (result.status >= 400) {
    const message =
      (result.data as { message?: string }).message ?? "Mock error";
    throw new AxiosError(
      message,
      AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response,
    );
  }

  return response;
};
