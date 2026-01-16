/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { api } from "../api";

const ONE_WEEK = 60 * 60 * 24 * 7;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body ?? {};
    const { data } = await api.post("/auth/login", { email, password });

    if (!data?.success) {
      return res.status(401).json({
        success: false,
        message: data?.message ?? "error while doing login",
      });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_WEEK,
      })
    );

    return res.status(200).json({ success: true, message: "Login OK" });
  } catch (err: any) {
    console.error("API /login error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
