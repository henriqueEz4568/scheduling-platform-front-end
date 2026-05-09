const UNAUTHORIZED_EVENT = "app:unauthorized";

let isHandlingUnauthorized = false;

export function dispatchUnauthorizedEvent() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function getUnauthorizedEventName() {
  return UNAUTHORIZED_EVENT;
}

export async function handleUnauthorizedRedirect(redirectPath = "/") {
  if (typeof window === "undefined" || isHandlingUnauthorized) {
    return;
  }

  isHandlingUnauthorized = true;

  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Error clearing auth cookie", error);
  } finally {
    window.localStorage.removeItem("auth_user");
    document.cookie =
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    window.location.href = redirectPath;
  }
}
