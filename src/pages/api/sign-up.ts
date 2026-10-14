import type { NextApiRequest, NextApiResponse } from "next";
import { isAxiosError } from "axios";
import { getApiClient } from "@/lib/server/api-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, email, password, role } = req.body ?? {};
    const { data } = await getApiClient().post("/auth/sign_up", {
      name,
      email,
      password,
      role,
    });

    if (!data?.success) {
      return res.status(400).json({
        success: false,
        message: data?.message ?? "Unable to create account",
      });
    }

    return res.status(201).json({
      success: true,
      user: data.user,
      message: "Account created successfully",
    });
  } catch (error) {
    if (isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Internal server error";

      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
