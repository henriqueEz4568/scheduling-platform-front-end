import { describe, expect, it } from "vitest";
import { getStatusVariant } from "@/lib/status";

describe("getStatusVariant", () => {
  it.each([
    ["confirmed", "success"],
    ["paid", "success"],
    ["pending", "warning"],
    ["in-progress", "info"],
    ["cancelled", "danger"],
    ["refunded", "danger"],
    ["CONFIRMED", "success"],
  ])("maps %s to %s", (status, variant) => {
    expect(getStatusVariant(status)).toBe(variant);
  });

  it.each(["archived", "", null, undefined])(
    "falls back to neutral for %s",
    (status) => {
      expect(getStatusVariant(status)).toBe("neutral");
    },
  );
});
