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
import { apiFetch } from "@/lib/client/api-fetch";
import type {
  CreatedAppointment,
  Customer,
  ScheduleFormValues,
  Service,
} from "@/types/appointments";
import type { ApiErrorResponse } from "@/types/api";

export default function NewAppointmentPage() {
  const router = useRouter();
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
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    [],
  );

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
          throw new Error(data?.message ?? "Unable to load customers.");
        }

        setCustomers(data?.customers ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error loading customers", error);
        setCustomers([]);
        const message =
          error instanceof Error ? error.message : "Unable to load customers.";
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
  }, []);

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
          throw new Error(data?.message ?? "Unable to load services.");
        }

        setServices(data?.services ?? []);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error loading services", error);
        setServices([]);
        const message =
          error instanceof Error ? error.message : "Unable to load services.";
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
  }, []);

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
    const startDate = new Date(values.start);
    const endDate = new Date(values.end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setSubmitError("Please provide valid start and end dates.");
      return;
    }

    if (!values.serviceId) {
      setSubmitError("Please select a service.");
      return;
    }

    const bookingPayload: Record<string, unknown> = {
      start: startDate,
      end: endDate,
      serviceId: values.serviceId,
    };

    if (customerMode === "existing") {
      if (!selectedCustomer) {
        setSubmitError("Please pick a customer.");
        return;
      }
      bookingPayload.customerId = String(selectedCustomer.id);
    } else {
      if (
        !values.customerName ||
        !values.customerEmail ||
        !values.customerPhone
      ) {
        setSubmitError(
          "Please fill in name, email, and phone for the customer.",
        );
        return;
      }

      bookingPayload.customer = {
        name: values.customerName,
        email: values.customerEmail,
        phone: values.customerPhone,
      };
    }

    setSubmitError(null);
    setCreatedAppointment(null);

    try {
      const response = await apiFetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const data = await readApiJson<CreatedAppointment & ApiErrorResponse>(
        response,
      );
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to create schedule.");
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
        error instanceof Error ? error.message : "Unable to create schedule.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create New Appointment
            </h1>
            <p className="text-muted-foreground">
              Fill the details below to schedule a service.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {createdAppointment ? (
          <AppointmentSummary appointment={createdAppointment} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
              <CardDescription>
                Provide the time, service, and customer information.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      {...register("start", { required: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      {...register("end", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceId">Service</Label>
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
                            ? "Loading services..."
                            : "No services available"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} -{" "}
                          {currencyFormatter.format(service.price)}
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
                    Customer Information
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
                      Select existing
                    </Button>
                    <Button
                      type="button"
                      variant={customerMode === "new" ? "default" : "outline"}
                      onClick={() => setCustomerMode("new")}
                    >
                      Register new
                    </Button>
                  </div>

                  {customerMode === "existing" && (
                    <div className="space-y-2">
                      <Label htmlFor="existingCustomerId">Customer</Label>
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
                        <Label htmlFor="customerName">Full name</Label>
                        <Input
                          id="customerName"
                          placeholder="Customer name"
                          {...register("customerName", { required: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="customer@email.com"
                          {...register("customerEmail", { required: true })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="customerPhone">Phone</Label>
                        <Input
                          id="customerPhone"
                          placeholder="+55 11 99999-0000"
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
                      ? "Creating..."
                      : "Create appointment"}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
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
