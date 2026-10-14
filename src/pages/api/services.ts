import type { NextApiRequest, NextApiResponse } from "next";
import type { AxiosError } from "axios";
import { getApiClient } from "@/lib/server/api-client";
import { extractAuthToken } from "@/lib/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token not provided.",
    });
  }

  try {
    if (req.method === "GET") {
      const response = await getApiClient().get("/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.status(200).json(response.data);
    }

    const response = await getApiClient().post("/services", req.body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(201).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status ?? 500;
    const message =
      axiosError.response?.data?.message ||
      (req.method === "POST"
        ? "Unable to create service."
        : "Unable to load services.");

    return res.status(status).json({
      success: false,
      message,
    });
  }
}
