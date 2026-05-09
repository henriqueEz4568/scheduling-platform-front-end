import { dispatchUnauthorizedEvent } from "@/lib/client/auth";

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? "same-origin",
  });

  if (
    response.status === 401 &&
    typeof input === "string" &&
    !input.startsWith("/api/login") &&
    !input.startsWith("/api/sign-up") &&
    !input.startsWith("/api/logout")
  ) {
    dispatchUnauthorizedEvent();
  }

  return response;
}
