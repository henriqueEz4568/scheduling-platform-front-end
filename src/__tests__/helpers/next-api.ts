import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type MockRequestInit = {
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  query?: Record<string, string | string[]>;
  body?: unknown;
};

type MockHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => unknown | Promise<unknown>;

export function createMockResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, unknown>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    setHeader(name: string, value: unknown) {
      res.headers[name.toLowerCase()] = value;
      return res;
    },
    getHeader(name: string) {
      return res.headers[name.toLowerCase()];
    },
  };

  return res;
}

export async function callHandler(
  handler: MockHandler,
  init: MockRequestInit = {},
) {
  const req = {
    method: "GET",
    headers: {},
    cookies: {},
    query: {},
    body: undefined,
    ...init,
  } as unknown as NextApiRequest;
  const res = createMockResponse();

  await handler(req, res as unknown as NextApiResponse);

  return res;
}

const emptyConfig = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

export function backendResponse<T>(status: number, data: T): AxiosResponse<T> {
  return {
    status,
    statusText: "",
    data,
    headers: {},
    config: emptyConfig,
  };
}

export function backendError(status: number, data: unknown = {}) {
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    emptyConfig,
    {},
    backendResponse(status, data),
  );
}

export function networkError(code = "ECONNREFUSED") {
  return new AxiosError("connect failed", code, emptyConfig, {});
}
