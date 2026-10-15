import { z } from "zod";
import { messageKey } from "@/i18n/translate";

const DURATION_MESSAGE = messageKey("validation.serviceDuration");
const PRICE_MESSAGE = messageKey("validation.servicePrice");

/**
 * Body of POST /api/services. Unknown keys are stripped, so only these
 * fields are forwarded to the backend.
 */
export const createServiceSchema = z.object({
  name: z.string().trim().min(1, messageKey("validation.serviceName")),
  duration: z.number({ error: DURATION_MESSAGE }).positive(DURATION_MESSAGE),
  price: z.number({ error: PRICE_MESSAGE }).min(0, PRICE_MESSAGE),
  description: z.string().trim().optional(),
});
