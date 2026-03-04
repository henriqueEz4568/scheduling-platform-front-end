import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres."),
    email: z.string().trim().email("Email invalido."),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter ao menos 1 letra maiuscula.")
      .regex(/[a-z]/, "A senha deve conter ao menos 1 letra minuscula.")
      .regex(/[0-9]/, "A senha deve conter ao menos 1 numero."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
    role: z.literal("admin"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem.",
    path: ["confirmPassword"],
  });

export type RegisterFormFields = z.infer<typeof registerSchema>;
