import type { NextApiRequest, NextApiResponse } from "next";
import { signUpPayloadSchema } from "@/lib/schemas/register";
import { getFirstIssueMessage } from "@/lib/schemas/utils";
import { getApiClient } from "@/lib/server/api-client";
import {
  describeError,
  mapBackendError,
  sendError,
  sendMethodNotAllowed,
} from "@/lib/server/proxy-handler";
import { getSignupRole } from "@/lib/server/signup-role";
import type { SignUpBackendResponse } from "@/types/register";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return sendMethodNotAllowed(res, ["POST"]);
  }

  // Strips anything the browser is not allowed to choose, role included.
  const payload = signUpPayloadSchema.safeParse(req.body);
  if (!payload.success) {
    return sendError(res, 400, getFirstIssueMessage(payload.error));
  }

  try {
    const { data } = await getApiClient().post<SignUpBackendResponse>(
      "/auth/sign_up",
      {
        ...payload.data,
        role: getSignupRole(),
      }
    );

    if (!data?.success) {
      return sendError(res, 400, data?.message ?? "Unable to create account");
    }

    return res.status(201).json({
      success: true,
      user: data.user,
      message: "Account created successfully",
    });
  } catch (error) {
    const { status, message } = mapBackendError(error, {
      fallbackMessage: "Internal server error",
    });

    if (status >= 500) {
      console.error("API /sign-up error:", describeError(error));
    }

    return sendError(res, status, message);
  }
}
