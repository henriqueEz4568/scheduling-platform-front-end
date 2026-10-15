import { z } from "zod";
import { messageKey } from "@/i18n/translate";

const nameSchema = z
  .string()
  .trim()
  .min(2, messageKey("validation.nameMin"));
const emailSchema = z.string().trim().email(messageKey("validation.emailInvalid"));
const passwordSchema = z
  .string()
  .min(8, messageKey("validation.passwordMin"))
  .regex(/[A-Z]/, messageKey("validation.passwordUppercase"))
  .regex(/[a-z]/, messageKey("validation.passwordLowercase"))
  .regex(/[0-9]/, messageKey("validation.passwordNumber"));

/**
 * Register form. Strict on purpose: the browser must never send a role (or
 * any other field the form does not own).
 */
export const registerSchema = z
  .strictObject({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, messageKey("validation.confirmPasswordRequired")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messageKey("validation.passwordMismatch"),
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
