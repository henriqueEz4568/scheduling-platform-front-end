import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { RegisterForm } from "@/components/register-form";
import { registerSchema } from "@/lib/schemas/register";
import type {
  RegisterApiResponse,
  RegisterFormFields,
  RegisterSubmitResult,
  SignUpPayload,
} from "@/types/register";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState, setError } =
    useForm<RegisterFormFields>({
      resolver: zodResolver(registerSchema),
    });

  const submitRegister = async (
    formValues: RegisterFormFields
  ): Promise<RegisterSubmitResult> => {
    const payload: SignUpPayload = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
    };

    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: RegisterApiResponse = await response.json();
      if (!response.ok || !data?.success) {
        const errorMessage = data?.message ?? "Erro ao criar conta.";
        const isEmailConflict = /email/i.test(errorMessage);

        if (isEmailConflict) {
          return {
            success: false,
            field: "email",
            message: errorMessage,
          };
        }

        return {
          success: false,
          field: "root",
          message: errorMessage,
        };
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";

      return {
        success: false,
        field: "root",
        message,
      };
    }
  };

  const handleFormSubmit: SubmitHandler<RegisterFormFields> = async (
    formValues
  ) => {
    const result = await submitRegister(formValues);
    if (!result.success) {
      setError(result.field ?? "root", {
        message: result.message ?? "Erro ao criar conta.",
      });
      return;
    }

    router.push("/");
  };

  return (
    <RegisterForm
      register={register}
      errors={formState.errors}
      isSubmitting={formState.isSubmitting}
      onSubmit={handleSubmit(handleFormSubmit)}
      loginPath="/"
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      onTogglePassword={() => setShowPassword((prev) => !prev)}
      onToggleConfirmPassword={() => setShowConfirmPassword((prev) => !prev)}
    />
  );
}
