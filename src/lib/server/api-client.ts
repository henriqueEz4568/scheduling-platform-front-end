import axios, { type AxiosInstance } from "axios";
import { isMock, mockAdapter } from "@/mock";

const REQUEST_TIMEOUT_MS = 10_000;
const DEVELOPMENT_API_URL = "http://localhost:3333/";
// Never contacted: in release mode the mock adapter answers every request.
const MOCK_API_URL = "http://mock.local/";

type ApiClientEnv = {
  API_URL?: string;
  NODE_ENV?: string;
};

let apiClient: AxiosInstance | null = null;

/**
 * Backend base URL for the BFF (server only, never exposed to the browser).
 * Falls back to localhost only in development; anywhere else a missing
 * API_URL is a configuration error.
 */
export function resolveApiBaseUrl(env: ApiClientEnv = process.env): string {
  const apiUrl = env.API_URL?.trim();
  if (apiUrl) {
    return apiUrl;
  }

  if (env.NODE_ENV === "development") {
    return DEVELOPMENT_API_URL;
  }

  throw new Error(
    "API_URL is not set. Define it in the server environment (see .env.example).",
  );
}

/**
 * Lazily created so `next build` does not require API_URL; the first request
 * in a misconfigured environment fails with the error above.
 */
export function getApiClient(): AxiosInstance {
  const mock = isMock();
  apiClient ??= axios.create({
    baseURL: mock ? MOCK_API_URL : resolveApiBaseUrl(),
    timeout: REQUEST_TIMEOUT_MS,
    adapter: mock ? mockAdapter : undefined,
  });

  return apiClient;
}
