import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import type { LogoutApiResponse } from "@/types/api";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    })
  );

  return res.status(200).json({
    success: true,
    message: "Logout OK",
  });
}
