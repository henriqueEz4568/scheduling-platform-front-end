import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, hasActiveSession } from "@/lib/auth/session";

const LOGIN_PATH = "/";
const DASHBOARD_PATH = "/dashboard";
const GUEST_ONLY_PATHS = new Set(["/", "/register"]);

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * First line of route protection: no session cookie (or an expired JWT)
 * never reaches /dashboard, and signed-in users skip the login/register
 * pages. API calls answering 401 are still handled on the client.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = hasActiveSession(token);
  const isGuestOnlyPath = GUEST_ONLY_PATHS.has(request.nextUrl.pathname);

  let response: NextResponse;
  if (isGuestOnlyPath) {
    response = authenticated
      ? redirectTo(request, DASHBOARD_PATH)
      : NextResponse.next();
  } else {
    response = authenticated
      ? NextResponse.next()
      : redirectTo(request, LOGIN_PATH);
  }

  if (token && !authenticated) {
    clearSessionCookie(response);
  }

  return response;
}

export const config = {
  matcher: ["/", "/register", "/dashboard/:path*"],
};
