"use client";

import type React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Calendar, User, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { FormFields, loginSchema } from "@/lib/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginApiResponse } from "@/types/auth";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<FormFields>({
    defaultValues: {},
    resolver: zodResolver(loginSchema),
  });
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const { email, password } = data;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: LoginApiResponse = await res.json();
      if (data.success === true) {
        if (typeof window !== "undefined") {
          if (data.user) {
            localStorage.setItem("auth_user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("auth_user");
          }
        }
        router.push("/dashboard");
      } else {
        const errorMessage = data?.message ?? "Internal Server Error";
        setError("password", {
          message: errorMessage,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.message ? error?.message : "Internal Server Error";
      console.error("Login error:", message);
      setError("root", {
        message,
      });

      return;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            SchedulePro
          </h1>
          <p className="text-muted-foreground">
            Intelligent Scheduling Platform
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {/* {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )} */}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("email", {
                      required: "Email is required",
                    })}
                    id="email"
                    //  type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12"
                  />
                  {formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12"
                  />

                  {formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {formState.errors.password.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div> */}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={formState?.isSubmitting}
              >
                {formState?.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              {formState.errors?.root?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {formState.errors.root.message}
                </p>
              )}
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <Link
                href="/register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Don&apos;t have an account?
              </Link>
            </div>

            {/* Demo Credentials */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
