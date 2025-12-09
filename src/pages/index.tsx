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
import { api } from "./api";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { FormFields } from "@/lib/schemas/login";
export default function LoginPage() {
  //const [email, setEmail] = useState("");
  //const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<FormFields>();
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    console.log(data);
    const { email, password } = data;
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success === true) {
        alert("Login successful!");
        Cookies.set("token", res.data.token, { expires: 7 });
        router.push("/dashboard");
      } else {
        alert(
          "Login failed: " + res.data?.message
            ? res.data?.message
            : "unknow error"
        );
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
      return;
    }
  };
  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     const res = await api.post("/auth/login", { email, password });
  //     if (res.data.success === true) {
  //       alert("Login successful!");
  //       Cookies.set("token", res.data.token, { expires: 7 });
  //       router.push("/dashboard");
  //     } else {
  //       alert(
  //         "Login failed: " + res.data?.message
  //           ? res.data?.message
  //           : "unknow error"
  //       );
  //       setError(res.data.message || "Login failed. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     setError("An unexpected error occurred. Please try again later.");
  //     setIsLoading(false);
  //     return;
  //   }
  // };

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
                      validate: (value) =>
                        value.includes("@") || "Email must contain @",
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
                      minLength: {
                        value: 5,
                        message: "Password must be at least 5 characters",
                      },
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Dont have an account?{" "}
                <Link
                  href="/register"
                  className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Register an account
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
