import type { NextApiRequest, NextApiResponse } from "next";
import { getRealtimeConfig } from "@/lib/realtime/config";
import { sendError, withAuth } from "@/lib/server/proxy-handler";
import type { RealtimeTokenResponse } from "@/types/realtime";

/**
 * Hands the session token to the browser so socket.io can authenticate
 * (the cookie itself is httpOnly). Only available while realtime is enabled
 * and the session is valid; never cached. See README > Realtime for the risk.
 */
const realtimeTokenHandler = withAuth({
  GET: ({ res, token }) => {
    const body: RealtimeTokenResponse = { success: true, token };
    return res.status(200).json(body);
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!getRealtimeConfig().enabled) {
    res.setHeader("Cache-Control", "no-store");
    return sendError(res, 404, "Realtime is disabled.");
  }

  return realtimeTokenHandler(req, res);
}
