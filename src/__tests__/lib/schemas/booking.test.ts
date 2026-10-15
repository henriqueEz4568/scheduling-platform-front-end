import { describe, expect, it } from "vitest";
import { createBookingSchema } from "@/lib/schemas/booking";
import { getFirstIssueMessage } from "@/lib/schemas/utils";

const start = "2026-10-20T13:00:00.000Z";
const end = "2026-10-20T14:00:00.000Z";

function firstMessage(input: unknown) {
  const result = createBookingSchema.safeParse(input);
  if (result.success) {
    throw new Error("expected the payload to be rejected");
  }
  return getFirstIssueMessage(result.error);
}

describe("createBookingSchema", () => {
  it("accepts an existing customer and strips unknown fields", () => {
    const result = createBookingSchema.safeParse({
      start,
      end,
      serviceId: "svc-1",
      customerId: "42",
      status: "paid",
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      start,
      end,
      serviceId: "svc-1",
      customerId: "42",
    });
  });

  it("accepts a new customer and trims its fields", () => {
    const result = createBookingSchema.safeParse({
      start,
      end: "2026-10-20T11:00:00-03:00",
      serviceId: "svc-1",
      customer: {
        name: " Ana ",
        email: "ana@example.com",
        phone: " 11 99999-0000 ",
      },
    });

    expect(result.success).toBe(true);
    expect(result.data?.customer).toEqual({
      name: "Ana",
      email: "ana@example.com",
      phone: "11 99999-0000",
    });
  });

  it("rejects invalid dates", () => {
    expect(
      firstMessage({ start: "", end, serviceId: "svc-1", customerId: "1" }),
    ).toBe("validation.invalidDates");
    expect(
      firstMessage({
        start: "tomorrow",
        end,
        serviceId: "svc-1",
        customerId: "1",
      }),
    ).toBe("validation.invalidDates");
  });

  it("rejects an end that is not after the start", () => {
    expect(
      firstMessage({ start, end: start, serviceId: "svc-1", customerId: "1" }),
    ).toBe("validation.endAfterStart");
  });

  it("requires a service", () => {
    expect(firstMessage({ start, end, serviceId: " ", customerId: "1" })).toBe(
      "validation.serviceRequired",
    );
  });

  it("requires exactly one kind of customer", () => {
    const customer = { name: "Ana", email: "ana@example.com", phone: "1" };

    expect(firstMessage({ start, end, serviceId: "svc-1" })).toBe(
      "validation.customerChoice",
    );
    expect(
      firstMessage({ start, end, serviceId: "svc-1", customerId: "1", customer }),
    ).toBe("validation.customerChoice");
    expect(firstMessage({ start, end, serviceId: "svc-1", customerId: "" })).toBe(
      "validation.customerRequired",
    );
  });

  it("validates the new customer fields", () => {
    expect(
      firstMessage({
        start,
        end,
        serviceId: "svc-1",
        customer: { name: "", email: "ana@example.com", phone: "1" },
      }),
    ).toBe("validation.customerFields");
    expect(
      firstMessage({
        start,
        end,
        serviceId: "svc-1",
        customer: { name: "Ana", email: "ana", phone: "1" },
      }),
    ).toBe("validation.customerEmail");
  });
});
