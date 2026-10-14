import { describe, expect, it } from "vitest";
import { createServiceSchema } from "@/lib/schemas/service";
import { getFirstIssueMessage } from "@/lib/schemas/utils";

const validService = {
  name: "Corte",
  duration: 45,
  price: 120,
  description: "Com finalização",
};

function firstMessage(input: unknown) {
  const result = createServiceSchema.safeParse(input);
  if (result.success) {
    throw new Error("expected the payload to be rejected");
  }
  return getFirstIssueMessage(result.error);
}

describe("createServiceSchema", () => {
  it("accepts a valid service, trims text and strips unknown fields", () => {
    const result = createServiceSchema.safeParse({
      ...validService,
      name: "  Corte  ",
      description: "  Com finalização ",
      userId: "someone-else",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validService);
  });

  it("accepts a free service and a missing description", () => {
    expect(
      createServiceSchema.safeParse({ name: "Avaliação", duration: 15, price: 0 })
        .success,
    ).toBe(true);
  });

  it("requires a name", () => {
    expect(firstMessage({ ...validService, name: "   " })).toBe(
      "Informe um nome para o serviço.",
    );
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY, "45"])(
    "rejects duration %s",
    (duration) => {
      expect(firstMessage({ ...validService, duration })).toBe(
        "Duração deve ser um número maior que zero.",
      );
    },
  );

  it.each([-1, Number.NaN, "120"])("rejects price %s", (price) => {
    expect(firstMessage({ ...validService, price })).toBe(
      "Preço deve ser um valor válido.",
    );
  });
});
