import type { ZodError } from "zod";

export function getFirstIssueMessage(
  error: ZodError,
  fallback = "Invalid request body.",
): string {
  return error.issues[0]?.message ?? fallback;
}
