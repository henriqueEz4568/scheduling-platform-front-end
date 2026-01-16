import type { NextApiRequest } from "next";

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

function getTokenFromCookies(req: NextApiRequest): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((segment) => segment.trim());
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");
    if (key === "token") {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function extractAuthToken(req: NextApiRequest): string | null {
  return getTokenFromAuthorizationHeader(req) ?? getTokenFromCookies(req);
}
