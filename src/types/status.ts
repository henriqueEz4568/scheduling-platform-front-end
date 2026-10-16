import type { ReactNode } from "react";

export type StatusVariant = "success" | "warning" | "info" | "danger" | "neutral";

export type StatusBadgeProps = {
  /** Status name as it comes from the API (e.g. "confirmed", "paid"). */
  status?: string | null;
  icon?: ReactNode;
  className?: string;
};
