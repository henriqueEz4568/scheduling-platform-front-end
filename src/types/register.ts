import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { z } from "zod";
import type {
  registerSchema,
  signUpPayloadSchema,
} from "@/lib/schemas/register";
import type { AuthUser } from "@/types/user";

export type RegisterFormFields = z.infer<typeof registerSchema>;

export type SignUpPayload = z.infer<typeof signUpPayloadSchema>;

export type SignUpBackendResponse = {
  success?: boolean;
  message?: string;
  user?: AuthUser | null;
};

export type RegisterSubmitResult = {
  success: boolean;
  message?: string;
  field?: keyof RegisterFormFields | "root";
};

export type RegisterApiResponse = {
  success?: boolean;
  message?: string;
};

export type RegisterFormProps = {
  register: UseFormRegister<RegisterFormFields>;
  errors: FieldErrors<RegisterFormFields>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  loginPath?: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
};
