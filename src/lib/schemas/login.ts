import z from "zod";
import { messageKey } from "@/i18n/translate";

export const loginSchema = z.object({
  email: z.string().email(messageKey("validation.emailInvalid")),
  password: z
    .string()
    .min(1, messageKey("validation.passwordRequired"))
    .min(6, messageKey("validation.passwordLoginMin")),
});

export type FormFields = z.infer<typeof loginSchema>;
