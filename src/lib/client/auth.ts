const UNAUTHORIZED_EVENT = "app:unauthorized";
const LOGOUT_EVENT = "app:logout";

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

/** Runs `listener` right before the session is torn down. */
export function onLogout(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(LOGOUT_EVENT, listener);

  return () => {
    window.removeEventListener(LOGOUT_EVENT, listener);
  };
}

export async function handleUnauthorizedRedirect(redirectPath = "/") {
  if (typeof window === "undefined" || isHandlingUnauthorized) {
    return;
  }

  isHandlingUnauthorized = true;
  window.dispatchEvent(new Event(LOGOUT_EVENT));

  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Error clearing auth cookie", error);
  } finally {
    // The token cookie is httpOnly: only /api/logout can clear it.
    window.localStorage.removeItem("auth_user");
    window.location.href = redirectPath;
  }
}
