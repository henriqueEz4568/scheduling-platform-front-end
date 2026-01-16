"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceSummary } from "@/components/service-summary";
import type {
  CreateServiceFormValues,
  CreatedService,
} from "@/types/services";

const defaultValues: CreateServiceFormValues = {
  name: "",
  duration: "",
  price: "",
  description: "",
};

export default function NewServicePage() {
  const [createdService, setCreatedService] = useState<CreatedService | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateServiceFormValues>({
    defaultValues,
  });

  const readApiJson = async <T,>(response: Response) => {
    try {
      return (await response.json()) as T;
    } catch {
      return {} as T;
    }
  };

  const onSubmit = async (values: CreateServiceFormValues) => {
    setSubmitError(null);

    const normalizedPayload = {
      name: values.name.trim(),
      duration: Number(values.duration),
      price: Number(values.price),
      description: values.description.trim(),
    };

    if (!normalizedPayload.name) {
      setSubmitError("Informe um nome para o serviço.");
      return;
    }

    if (!Number.isFinite(normalizedPayload.duration) || normalizedPayload.duration <= 0) {
      setSubmitError("Duração deve ser um número maior que zero.");
      return;
    }

    if (!Number.isFinite(normalizedPayload.price) || normalizedPayload.price < 0) {
      setSubmitError("Preço deve ser um valor válido.");
      return;
    }

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedPayload),
      });

      const data = await readApiJson<CreatedService & { message?: string }>(
        response
      );

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to create service.");
      }

      setCreatedService(data);
      reset(defaultValues);
    } catch (error) {
      console.error("Error creating service", error);
      setCreatedService(null);
      const message =
        error instanceof Error ? error.message : "Unable to create service.";
      setSubmitError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-950/5 to-muted py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3 text-center lg:text-left flex-1 min-w-[250px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide">
              <Sparkles className="h-4 w-4" />
              Novo Serviço
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Cadastre um serviço incrível
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto lg:mx-0">
              Defina nome, duração e valor para disponibilizar seus serviços com
              um visual moderno e pronto para ser agendado pelos seus clientes.
            </p>
          </div>
          <Button variant="outline" className="self-start" asChild>
            <Link href="/dashboard">Voltar para o dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-none shadow-xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl font-semibold">
                Informações do serviço
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para criar um novo serviço.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do serviço</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Corte premium com finalização"
                    {...register("name", { required: "O nome é obrigatório." })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={5}
                      step={5}
                      placeholder="45"
                      {...register("duration", {
                        required: "Informe a duração estimada.",
                      })}
                    />
                    {errors.duration && (
                      <p className="text-sm text-destructive">
                        {errors.duration.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step={5}
                      placeholder="120"
                      {...register("price", {
                        required: "Defina um valor para o serviço.",
                      })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Conte os diferenciais, materiais usados ou qualquer detalhe importante."
                    {...register("description")}
                  />
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar serviço"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {createdService ? (
            <ServiceSummary service={createdService} />
          ) : (
            <Card className="border-dashed border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background shadow-none">
              <CardHeader className="space-y-4 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  O resumo aparecerá aqui
                </CardTitle>
                <CardDescription>
                  Assim que o serviço for criado, você verá todos os detalhes e
                  poderá compartilhar com a sua equipe.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
