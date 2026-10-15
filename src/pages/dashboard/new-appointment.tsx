"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerSelect } from "@/components/customer-select";
import { AppointmentSummary } from "@/components/appointment-summary";
import { getAppLayout } from "@/components/app-layout";
import { apiFetch } from "@/lib/client/api-fetch";
import { createBookingSchema } from "@/lib/schemas/booking";
import { getFirstIssueMessage } from "@/lib/schemas/utils";
import { toIsoDateTime } from "@/utils";
import { useTranslation } from "@/i18n/use-translation";
import type {
  CreateBookingPayload,
  CreatedAppointment,
  Customer,
  ScheduleFormValues,
  Service,
} from "@/types/appointments";
import type { ApiErrorResponse } from "@/types/api";

export default function NewAppointmentPage() {
  const router = useRouter();
  const { t, tm, formatCurrency } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] =
    useState<CreatedAppointment | null>(null);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const { register, handleSubmit, formState, watch, setValue, reset } =
    useForm<ScheduleFormValues>({
      defaultValues: {
        start: "",
        end: "",
        serviceId: "",
        existingCustomerId: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
      },
    });

  const selectedCustomerId = watch("existingCustomerId");
  const selectedServiceId = watch("serviceId");
  const selectedCustomer = useMemo(() => {
    return customers.find(
      (customer) => String(customer.id) === selectedCustomerId,
    );
  }, [customers, selectedCustomerId]);

  const readApiJson = async <T,>(response: Response) => {
    try {
      return (await response.json()) as T;
    } catch {
      return {} as T;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError(null);
      try {
        const response = await apiFetch("/api/customers", {
          signal: controller.signal,
        });
        const data = await readApiJson<
          {
            customers?: Customer[];
            message?: string;
          } & ApiErrorResponse
        >(response);

        if (!response.ok) {
          throw new Error(
            tm(data?.message) || t("newAppointment.loadCustomersError"),
          );
        }

        setCustomers(data?.customers ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error loading customers", error);
        setCustomers([]);
        const message =
          error instanceof Error
            ? error.message
            : t("newAppointment.loadCustomersError");
        setCustomersError(message);
      } finally {
        if (!controller.signal.aborted) {
          setCustomersLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      controller.abort();
    };
  }, [t, tm]);

  useEffect(() => {
    const controller = new AbortController();

    const loadServices = async () => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await apiFetch("/api/services", {
          signal: controller.signal,
        });
        const data = await readApiJson<
          {
            services?: Service[];
            message?: string;
          } & ApiErrorResponse
        >(response);

        if (!response.ok) {
          throw new Error(
            tm(data?.message) || t("newAppointment.loadServicesError"),
          );
        }

        setServices(data?.services ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error loading services", error);
        setServices([]);
        const message =
          error instanceof Error
            ? error.message
            : t("newAppointment.loadServicesError");
        setServicesError(message);
      } finally {
        if (!controller.signal.aborted) {
          setServicesLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      controller.abort();
    };
  }, [t, tm]);

  useEffect(() => {
    if (customers.length && !selectedCustomerId) {
      setValue("existingCustomerId", String(customers[0].id));
      setCustomerMode("existing");
    }

    if (!customers.length) {
      setValue("existingCustomerId", "");
      setCustomerMode("new");
    }
  }, [customers, selectedCustomerId, setValue]);

  useEffect(() => {
    if (services.length && !selectedServiceId) {
      setValue("serviceId", services[0].id);
    }
    if (!services.length && selectedServiceId) {
      setValue("serviceId", "");
    }
  }, [services, selectedServiceId, setValue]);

  const onSubmit = async (values: ScheduleFormValues) => {
    const bookingPayload: CreateBookingPayload = {
      start: toIsoDateTime(values.start),
      end: toIsoDateTime(values.end),
      serviceId: values.serviceId,
      ...(customerMode === "existing"
        ? { customerId: selectedCustomer ? String(selectedCustomer.id) : "" }
        : {
            customer: {
              name: values.customerName,
              email: values.customerEmail,
              phone: values.customerPhone,
            },
          }),
    };

    const parsedPayload = createBookingSchema.safeParse(bookingPayload);
    if (!parsedPayload.success) {
      setSubmitError(tm(getFirstIssueMessage(parsedPayload.error)));
      return;
    }

    setSubmitError(null);
    setCreatedAppointment(null);

    try {
      const response = await apiFetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedPayload.data),
      });

      const data = await readApiJson<CreatedAppointment & ApiErrorResponse>(
        response,
      );
      if (!response.ok) {
        throw new Error(
          tm(data?.message) || t("newAppointment.createError"),
        );
      }

      setCreatedAppointment(data);
      reset();
      setValue(
        "existingCustomerId",
        customers.length ? String(customers[0].id) : "",
      );
      setValue("serviceId", services.length ? services[0].id : "");
    } catch (error) {
      console.error("Error creating schedule", error);
      setCreatedAppointment(null);
      setSubmitError(
        error instanceof Error
          ? error.message
          : t("newAppointment.createError"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("newAppointment.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("newAppointment.description")}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">{t("common.backToDashboard")}</Link>
          </Button>
        </div>

        {createdAppointment ? (
          <AppointmentSummary appointment={createdAppointment} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("newAppointment.cardTitle")}</CardTitle>
              <CardDescription>
                {t("newAppointment.cardDescription")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start">{t("newAppointment.start")}</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      {...register("start", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">{t("newAppointment.end")}</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      {...register("end", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceId">{t("newAppointment.service")}</Label>
                  <Input
                    id="serviceId"
                    type="hidden"
                    {...register("serviceId", { required: true })}
                  />
                  <Select
                    value={selectedServiceId}
                    disabled={servicesLoading || !services.length}
                    onValueChange={(value) =>
                      setValue("serviceId", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger aria-invalid={!selectedServiceId}>
                      <SelectValue
                        placeholder={
                          servicesLoading
                            ? t("newAppointment.loadingServices")
                            : t("newAppointment.noServices")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} -{" "}
                          {formatCurrency(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {servicesError && (
                    <p className="text-sm text-destructive">{servicesError}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    {t("newAppointment.customerInfo")}
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      type="button"
                      variant={
                        customerMode === "existing" ? "default" : "outline"
                      }
                      onClick={() => setCustomerMode("existing")}
                      disabled={!customers.length || customersLoading}
                    >
                      {t("newAppointment.selectExisting")}
                    </Button>
                    <Button
                      type="button"
                      variant={customerMode === "new" ? "default" : "outline"}
                      onClick={() => setCustomerMode("new")}
                    >
                      {t("newAppointment.registerNew")}
                    </Button>
                  </div>

                  {customerMode === "existing" && (
                    <div className="space-y-2">
                      <Label htmlFor="existingCustomerId">
                        {t("newAppointment.customer")}
                      </Label>
                      <Input
                        id="existingCustomerId"
                        type="hidden"
                        {...register("existingCustomerId", { required: true })}
                      />
                      <CustomerSelect
                        customers={customers}
                        value={selectedCustomerId}
                        loading={customersLoading}
                        onChange={(customer) =>
                          setValue(
                            "existingCustomerId",
                            customer ? String(customer.id) : "",
                            { shouldDirty: true, shouldValidate: true },
                          )
                        }
                      />
                      {customersError && (
                        <p className="text-sm text-destructive">
                          {customersError}
                        </p>
                      )}
                    </div>
                  )}

                  {customerMode === "new" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          {t("newAppointment.fullName")}
                        </Label>
                        <Input
                          id="customerName"
                          placeholder={t("newAppointment.customerNamePlaceholder")}
                          {...register("customerName", { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">{t("common.email")}</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder={t("newAppointment.customerEmailPlaceholder")}
                          {...register("customerEmail", { required: true })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="customerPhone">{t("common.phone")}</Label>
                        <Input
                          id="customerPhone"
                          placeholder={t("newAppointment.phonePlaceholder")}
                          {...register("customerPhone", { required: true })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={formState.isSubmitting}
                    className="min-w-[160px]"
                  >
                    {formState.isSubmitting
                      ? t("newAppointment.submitting")
                      : t("newAppointment.submit")}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => router.push("/dashboard")}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

NewAppointmentPage.getLayout = getAppLayout;
