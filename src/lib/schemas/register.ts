import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres.");
const emailSchema = z.string().trim().email("Email invalido.");
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter ao menos 1 letra maiuscula.")
  .regex(/[a-z]/, "A senha deve conter ao menos 1 letra minuscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos 1 numero.");

/**
 * Register form. Strict on purpose: the browser must never send a role (or
 * any other field the form does not own).
 */
export const registerSchema = z
  .strictObject({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });

/**
 * Body accepted by POST /api/sign-up. Unknown keys (role included) are
 * stripped; the role is always decided by the BFF.
 */
export const signUpPayloadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
