export type RealtimeConfigInput = {
  enabled?: string;
  url?: string;
};

export type RealtimeConfig =
  | { enabled: true; url: string }
  | { enabled: false; reason: "disabled" | "missing-url" | "invalid-url" };

export type RealtimeStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type RealtimeNotification = Record<string, unknown>;

export type UseRealtimeResult = {
  enabled: boolean;
  status: RealtimeStatus;
  notifications: RealtimeNotification[];
};

export type RealtimeTokenResponse = {
  success?: boolean;
  token?: string;
  message?: string;
};
