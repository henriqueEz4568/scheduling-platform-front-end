import { z } from "zod";

const DURATION_MESSAGE = "Duração deve ser um número maior que zero.";
const PRICE_MESSAGE = "Preço deve ser um valor válido.";

/**
 * Body of POST /api/services. Unknown keys are stripped, so only these
 * fields are forwarded to the backend.
 */
export const createServiceSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome para o serviço."),
  duration: z.number({ error: DURATION_MESSAGE }).positive(DURATION_MESSAGE),
  price: z.number({ error: PRICE_MESSAGE }).min(0, PRICE_MESSAGE),
  description: z.string().trim().optional(),
});
