import { FormEventHandler } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { RegisterFormFields } from "@/lib/schemas/register";

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
  roleValue?: RegisterFormFields["role"];
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
};
