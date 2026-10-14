import { isAxiosError } from "axios";
import type { NextApiHandler, NextApiResponse } from "next";
import { hasActiveSession } from "@/lib/auth/session";
import { getApiClient } from "@/lib/server/api-client";
import { extractAuthToken } from "@/lib/server/auth";
import { getFirstIssueMessage } from "@/lib/schemas/utils";
import type { ApiErrorBody } from "@/types/api";
import type {
  AuthenticatedHandler,
  AuthenticatedHandlers,
  BackendErrorOptions,
  HttpMethod,
  MappedBackendError,
  ProxyRoute,
  ProxyRoutes,
} from "@/types/proxy";

export function sendError(
  res: NextApiResponse,
  status: number,
  message: string,
) {
  const body: ApiErrorBody = { success: false, message };
  return res.status(status).json(body);
}

export function sendMethodNotAllowed(
  res: NextApiResponse,
  allowedMethods: string[],
) {
  res.setHeader("Allow", allowedMethods.join(", "));
  return sendError(res, 405, "Method not allowed");
}

/**
 * Maps an error thrown while calling the backend to the status/message the
 * BFF returns. Backend statuses are preserved; backend messages are only
 * forwarded for 4xx so 5xx internals never reach the browser.
 */
export function mapBackendError(
  error: unknown,
  { fallbackMessage, statusMessages = {} }: BackendErrorOptions,
): MappedBackendError {
  if (!isAxiosError(error)) {
    return { status: 500, message: fallbackMessage };
  }

  const { response } = error;
  if (!response) {
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    return { status: timedOut ? 504 : 502, message: fallbackMessage };
  }

  const { status } = response;
  const overrideMessage = statusMessages[status];
  if (overrideMessage) {
    return { status, message: overrideMessage };
  }

  const backendMessage = (response.data as { message?: unknown } | undefined)
    ?.message;
  if (status < 500 && typeof backendMessage === "string" && backendMessage) {
    return { status, message: backendMessage };
  }

  return { status, message: fallbackMessage };
}

/** Log-safe summary: never prints the axios config (headers, body, token). */
export function describeError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? "no response";
    return `${error.code ?? "AxiosError"} (${status}): ${error.message}`;
  }

  return error instanceof Error ? error.message : String(error);
}

/**
 * Method validation (405) + auth token (401) for authenticated BFF routes.
 */
export function withAuth(handlers: AuthenticatedHandlers): NextApiHandler {
  const allowedMethods = Object.keys(handlers);

  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");

    const method = req.method as HttpMethod;
    const handler = Object.hasOwn(handlers, method)
      ? handlers[method]
      : undefined;
    if (!handler) {
      return sendMethodNotAllowed(res, allowedMethods);
    }

    const token = extractAuthToken(req);
    if (!token) {
      return sendError(res, 401, "Authentication token not provided.");
    }

    if (!hasActiveSession(token)) {
      return sendError(res, 401, "Session expired.");
    }

    await handler({ req, res, token });
  };
}

function proxyTo(method: HttpMethod, route: ProxyRoute): AuthenticatedHandler {
  return async ({ req, res, token }) => {
    let data: unknown = method === "GET" ? undefined : req.body;

    if (route.bodySchema) {
      const parsed = route.bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 400, getFirstIssueMessage(parsed.error));
      }
      data = parsed.data;
    }

    try {
      const response = await getApiClient().request({
        method,
        url: route.path,
        data,
        params: route.forwardQuery ? req.query : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.status(response.status).json(response.data);
    } catch (error) {
      const { status, message } = mapBackendError(error, {
        fallbackMessage: route.errorMessage,
      });

      if (status >= 500) {
        console.error(
          `[bff] ${method} ${route.path} failed:`,
          describeError(error),
        );
      }

      return sendError(res, status, message);
    }
  };
}

/**
 * Authenticated pass-through to the backend, one entry per allowed method.
 */
export function createProxyHandler(routes: ProxyRoutes): NextApiHandler {
  const handlers: AuthenticatedHandlers = {};

  for (const [method, route] of Object.entries(routes) as [
    HttpMethod,
    ProxyRoute,
  ][]) {
    handlers[method] = proxyTo(method, route);
  }

  return withAuth(handlers);
}
