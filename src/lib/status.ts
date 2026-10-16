import type { StatusVariant } from "@/types/status";

const STATUS_VARIANTS: Record<string, StatusVariant> = {
  confirmed: "success",
  paid: "success",
  pending: "warning",
  "in-progress": "info",
  cancelled: "danger",
  refunded: "danger",
};

/** Badge variant for a booking or payment status; unknown ones stay neutral. */
export function getStatusVariant(status?: string | null): StatusVariant {
  return (status && STATUS_VARIANTS[status.toLowerCase()]) || "neutral";
}
