import type { NextApiRequest, NextApiResponse } from "next";
import type { AxiosError } from "axios";
import { api } from "./index";
import { extractAuthToken } from "@/lib/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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
    const response = await api.get("/customers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message || "Unable to load customers.";
    const status = axiosError.response?.status ?? 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}
