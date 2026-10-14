import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiFetch } from "@/lib/client/api-fetch";
import { onLogout } from "@/lib/client/auth";
import { getRealtimeConfig } from "@/lib/realtime/config";
import type {
  RealtimeNotification,
  RealtimeStatus,
  RealtimeTokenResponse,
  UseRealtimeResult,
} from "@/types/realtime";

const realtimeConfig = getRealtimeConfig();
const isDevelopment = process.env.NODE_ENV !== "production";

let misconfigurationReported = false;

function reportMisconfiguration() {
  if (
    realtimeConfig.enabled ||
    realtimeConfig.reason === "disabled" ||
    misconfigurationReported ||
    !isDevelopment
  ) {
    return;
  }

  misconfigurationReported = true;
  console.warn(
    "[realtime] NEXT_PUBLIC_REALTIME_ENABLED is true but NEXT_PUBLIC_REALTIME_URL is missing or invalid; realtime stays off.",
  );
}

async function fetchRealtimeToken(signal: AbortSignal) {
  try {
    const response = await apiFetch("/api/realtime-token", {
      signal,
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RealtimeTokenResponse;
    return typeof data.token === "string" && data.token ? data.token : null;
  } catch {
    return null;
  }
}

/**
 * Socket.io notifications. Only connects when NEXT_PUBLIC_REALTIME_ENABLED is
 * "true" and NEXT_PUBLIC_REALTIME_URL is a valid URL; the auth token comes
 * from /api/realtime-token because the session cookie is httpOnly.
 */
export function useRealtime(): UseRealtimeResult {
  const [status, setStatus] = useState<RealtimeStatus>(
    realtimeConfig.enabled ? "connecting" : "disabled",
  );
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    [],
  );

  useEffect(() => {
    if (!realtimeConfig.enabled) {
      reportMisconfiguration();
      return;
    }

    const { url } = realtimeConfig;
    const controller = new AbortController();
    let socket: Socket | null = null;
    let connectErrorReported = false;

    const teardown = () => {
      controller.abort();
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;
    };

    const connect = async () => {
      setStatus("connecting");

      const token = await fetchRealtimeToken(controller.signal);
      if (controller.signal.aborted) {
        return;
      }

      if (!token) {
        setStatus("error");
        return;
      }

      const client = io(url, { auth: { token } });
      socket = client;

      client.on("connect", () => {
        connectErrorReported = false;
        setStatus("connected");
      });

      client.on("disconnect", () => {
        setStatus("disconnected");
      });

      client.on("connect_error", (error) => {
        setStatus("error");

        // The server refused the handshake (e.g. bad token): socket.io will
        // not retry, so drop the socket. Transport errors keep the built-in
        // reconnection.
        if (!client.active) {
          teardown();
        }

        if (isDevelopment && !connectErrorReported) {
          connectErrorReported = true;
          console.warn("[realtime] connection failed:", error.message);
        }
      });

      client.on("ping", (data) => {
        setNotifications((prev) => [data as RealtimeNotification, ...prev]);
      });
    };

    void connect();

    const stopListeningToLogout = onLogout(() => {
      teardown();
      setStatus("disconnected");
    });

    return () => {
      stopListeningToLogout();
      teardown();
    };
  }, []);

  return {
    enabled: realtimeConfig.enabled,
    status,
    notifications,
  };
}
