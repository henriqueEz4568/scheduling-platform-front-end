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
