import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { RegisterForm } from "@/components/register-form";
import { registerSchema } from "@/lib/schemas/register";
import { useTranslation } from "@/i18n/use-translation";
import type {
  RegisterApiResponse,
  RegisterFormFields,
  RegisterSubmitResult,
  SignUpPayload,
} from "@/types/register";

export default function RegisterPage() {
  const router = useRouter();
  const { t, tm } = useTranslation();
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
        const errorMessage = tm(data?.message) || t("register.error");
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
    } catch {
      return {
        success: false,
        field: "root",
        message: t("common.genericError"),
      };
    }
  };

  const handleFormSubmit: SubmitHandler<RegisterFormFields> = async (
    formValues
  ) => {
    const result = await submitRegister(formValues);
    if (!result.success) {
      setError(result.field ?? "root", {
        message: result.message ?? t("register.error"),
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
