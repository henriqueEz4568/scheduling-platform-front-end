import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { getApiClient } from "@/lib/server/api-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import {
  describeError,
  mapBackendError,
  sendError,
  sendMethodNotAllowed,
} from "@/lib/server/proxy-handler";
import type { LoginBackendResponse } from "@/types/auth";

const ONE_WEEK = 60 * 60 * 24 * 7;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const LOGIN_FAILED_MESSAGE = "Unable to sign in right now. Please try again.";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  try {
    const { email, password } = req.body ?? {};
    const { data } = await getApiClient().post<LoginBackendResponse>(
      "/auth/login",
      { email, password }
    );

    if (!data?.success) {
      return sendError(res, 401, data?.message ?? INVALID_CREDENTIALS_MESSAGE);
    }

    if (!data.token) {
      console.error("API /login error: backend answered without a token");
      return sendError(res, 502, LOGIN_FAILED_MESSAGE);
    }

    res.setHeader(
      "Set-Cookie",
      serialize(AUTH_COOKIE_NAME, data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_WEEK,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Login OK",
      user: data.user ?? null,
    });
  } catch (error) {
    const { status, message } = mapBackendError(error, {
      fallbackMessage: LOGIN_FAILED_MESSAGE,
      statusMessages: { 401: INVALID_CREDENTIALS_MESSAGE },
    });

    if (status >= 500) {
      console.error("API /login error:", describeError(error));
    }

    return sendError(res, status, message);
  }
}
