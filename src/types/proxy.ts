import type { NextApiRequest, NextApiResponse } from "next";
import type { ZodType } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthenticatedContext = {
  req: NextApiRequest;
  res: NextApiResponse;
  token: string;
};

export type AuthenticatedHandler = (
  context: AuthenticatedContext,
) => unknown | Promise<unknown>;

export type AuthenticatedHandlers = Partial<
  Record<HttpMethod, AuthenticatedHandler>
>;

export type ProxyRoute = {
  /** Backend path, e.g. "/bookings". */
  path: string;
  /** Message returned when the backend fails without a usable message. */
  errorMessage: string;
  /** Forward the request query string to the backend. */
  forwardQuery?: boolean;
  /** Validates req.body; only the parsed output is forwarded. */
  bodySchema?: ZodType;
};

export type ProxyRoutes = Partial<Record<HttpMethod, ProxyRoute>>;

export type BackendErrorOptions = {
  fallbackMessage: string;
  /** Replaces the backend message for specific statuses (e.g. 401 on login). */
  statusMessages?: Partial<Record<number, string>>;
};

export type MappedBackendError = {
  status: number;
  message: string;
};
