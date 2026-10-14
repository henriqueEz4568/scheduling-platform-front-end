import { format } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return format(date, "yyyy-MM-dd HH:mm:ss");
}

export function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return "-";
  }

  return currencyFormatter.format(value);
}

/** ISO string for a date input value, or "" when it is not a valid date. */
export function toIsoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
