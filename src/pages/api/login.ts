import type { NextApiRequest, NextApiResponse } from "next";
import { api } from "../api";
import Cookies from "js-cookie";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { email, password } = req.body;
      const loginRequest = await api.post("/auth/login", { email, password });
      if (loginRequest.data.success === true) {
        console.log("Login successful!");
        Cookies.set("token", loginRequest.data.token, { expires: 7 });
        return res.status(200).json({
          success: true,
          message: "POST recebido com sucesso",
          email,
          password,
        });
      } else {
        res.status(401).json({
          success: false,
          message: loginRequest?.data?.message ?? "error while doing login",
        });
      }
    }

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("API /login error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
