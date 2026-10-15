import { z } from "zod";
import { messageKey } from "@/i18n/translate";

const INVALID_DATES_MESSAGE = messageKey("validation.invalidDates");
const CUSTOMER_FIELDS_MESSAGE = messageKey("validation.customerFields");

const dateTimeSchema = z.iso.datetime({
  offset: true,
  error: INVALID_DATES_MESSAGE,
});

const newCustomerSchema = z.object({
  name: z.string().trim().min(1, CUSTOMER_FIELDS_MESSAGE),
  email: z
    .string()
    .trim()
    .min(1, CUSTOMER_FIELDS_MESSAGE)
    .email(messageKey("validation.customerEmail")),
  phone: z.string().trim().min(1, CUSTOMER_FIELDS_MESSAGE),
});

/**
 * Body of POST /api/bookings. Unknown keys are stripped, so only these
 * fields are forwarded to the backend.
 */
export const createBookingSchema = z
  .object({
    start: dateTimeSchema,
    end: dateTimeSchema,
    serviceId: z.string().trim().min(1, messageKey("validation.serviceRequired")),
    customerId: z.string().trim().min(1, messageKey("validation.customerRequired")).optional(),
    customer: newCustomerSchema.optional(),
  })
  .superRefine((booking, ctx) => {
    if (new Date(booking.end) <= new Date(booking.start)) {
      ctx.addIssue({
        code: "custom",
        message: messageKey("validation.endAfterStart"),
        path: ["end"],
      });
    }

    const hasExistingCustomer = booking.customerId !== undefined;
    const hasNewCustomer = booking.customer !== undefined;
    if (hasExistingCustomer === hasNewCustomer) {
      ctx.addIssue({
        code: "custom",
        message: messageKey("validation.customerChoice"),
        path: ["customer"],
      });
    }
  });
