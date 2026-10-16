import Link from "next/link";
import { Calendar, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterFormProps } from "@/types/register";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n/use-translation";

export function RegisterForm({
  register,
  errors,
  isSubmitting,
  onSubmit,
  loginPath = "/",
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
}: RegisterFormProps) {
  const { t, tm } = useTranslation();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/15 via-background to-secondary/20 flex items-center justify-center p-4">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("common.appName")}
          </h1>
          <p className="text-muted-foreground">{t("register.tagline")}</p>
        </div>

        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {t("register.title")}
            </CardTitle>
            <CardDescription>{t("register.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("register.nameLabel")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder={t("register.namePlaceholder")}
                    className="pl-10 h-12"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-destructive text-sm mt-1">
                    {tm(errors.name.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("register.emailLabel")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder={t("register.emailPlaceholder")}
                    className="pl-10 h-12"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {tm(errors.email.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("register.passwordLabel")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.passwordPlaceholder")}
                    className="pl-10 pr-10 h-12"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={onTogglePassword}
                    aria-label={
                      showPassword
                        ? t("common.hidePassword")
                        : t("common.showPassword")
                    }
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {tm(errors.password.message)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("register.confirmPasswordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    className="pl-10 pr-10 h-12"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={onToggleConfirmPassword}
                    aria-label={
                      showConfirmPassword
                        ? t("common.hidePassword")
                        : t("common.showPassword")
                    }
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {tm(errors.confirmPassword.message)}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("register.submitting") : t("register.submit")}
              </Button>

              {errors.root?.message && (
                <p className="text-destructive text-sm mt-1">
                  {tm(errors.root.message)}
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <Link
                href={loginPath}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("register.hasAccount")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
