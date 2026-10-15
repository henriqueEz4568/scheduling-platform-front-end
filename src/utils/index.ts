/** ISO string for a date input value, or "" when it is not a valid date. */
export function toIsoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
