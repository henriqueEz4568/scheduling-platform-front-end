import { z } from "zod";

const INVALID_DATES_MESSAGE = "Please provide valid start and end dates.";
const CUSTOMER_FIELDS_MESSAGE =
  "Please fill in name, email, and phone for the customer.";

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
    .email("Please provide a valid customer email."),
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
    serviceId: z.string().trim().min(1, "Please select a service."),
    customerId: z.string().trim().min(1, "Please pick a customer.").optional(),
    customer: newCustomerSchema.optional(),
  })
  .superRefine((booking, ctx) => {
    if (new Date(booking.end) <= new Date(booking.start)) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be after start date.",
        path: ["end"],
      });
    }

    const hasExistingCustomer = booking.customerId !== undefined;
    const hasNewCustomer = booking.customer !== undefined;
    if (hasExistingCustomer === hasNewCustomer) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either an existing customer or a new customer.",
        path: ["customer"],
      });
    }
  });
