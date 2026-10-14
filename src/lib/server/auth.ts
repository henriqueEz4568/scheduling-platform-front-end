import type { NextApiRequest } from "next";

export const AUTH_COOKIE_NAME = "token";

function getTokenFromAuthorizationHeader(req: NextApiRequest): string | null {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function extractAuthToken(req: NextApiRequest): string | null {
  return (
    req.cookies[AUTH_COOKIE_NAME] || getTokenFromAuthorizationHeader(req) || null
  );
}
