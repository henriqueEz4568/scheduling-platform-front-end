"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";
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
import { CustomerSelect } from "@/components/customer-select";

type Customer = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
};

const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "+55 11 95555-0000",
  },
  {
    id: 2,
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "+55 11 97777-0000",
  },
  {
    id: 3,
    name: "Carla Souza",
    email: "carla.souza@example.com",
    phone: "+55 11 91111-0000",
  },
  {
    id: 4,
    name: "Felipe Santos",
    email: "felipe.santos@example.com",
    phone: "+55 11 93333-0000",
  },
  {
    id: 5,
    name: "Ana Paula",
    email: "ana.paula@example.com",
    phone: "+55 11 92222-0000",
  },
];

type ScheduleFormValues = {
  start: string;
  end: string;
  serviceId: string;
  existingCustomerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = Cookies.get("token") || "";
  const customers = mockCustomers;
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    customers.length ? "existing" : "new"
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const defaultCustomerId = customers.length ? String(customers[0].id) : "";

  const {
    register,
    handleSubmit,
    formState,
    watch,
    setValue,
    reset,
  } = useForm<ScheduleFormValues>({
    defaultValues: {
      start: "",
      end: "",
      serviceId: "",
      existingCustomerId: defaultCustomerId,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });

  const selectedCustomerId = watch("existingCustomerId");

  const selectedCustomer = useMemo(() => {
    return customers.find(
      (customer) => String(customer.id) === selectedCustomerId
    );
  }, [customers, selectedCustomerId]);

  const onSubmit = async (values: ScheduleFormValues) => {
    if (!apiBaseUrl) {
      setSubmitError("API URL is not configured.");
      return;
    }

    const startDate = new Date(values.start);
    const endDate = new Date(values.end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setSubmitError("Please provide valid start and end dates.");
      return;
    }

    if (!values.serviceId) {
      setSubmitError("Please provide a service ID.");
      return;
    }

    let customerPayload: Customer | undefined = undefined;

    if (customerMode === "existing") {
      if (!selectedCustomer) {
        setSubmitError("Please pick a customer.");
        return;
      }
      customerPayload = selectedCustomer;
    } else {
      if (!values.customerName || !values.customerEmail || !values.customerPhone) {
        setSubmitError("Please fill in name, email, and phone for the customer.");
        return;
      }

      customerPayload = {
        id: "",
        name: values.customerName,
        email: values.customerEmail,
        phone: values.customerPhone,
      };
    }

    const body = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      serviceId: Number(values.serviceId),
      customer: {
        name: customerPayload?.name,
        email: customerPayload?.email,
        phone: customerPayload?.phone,
      },
    };

    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch(`${apiBaseUrl}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Unable to create schedule.");
      }

      setSubmitSuccess("Schedule created successfully.");
      reset();
      setValue("existingCustomerId", defaultCustomerId);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error creating schedule", error);
      setSubmitError((error as Error).message);
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
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  type="number"
                  min={1}
                  placeholder="Enter the service ID"
                  {...register("serviceId", { required: true })}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Customer Information
                </Label>
                <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    variant={customerMode === "existing" ? "default" : "outline"}
                    onClick={() => setCustomerMode("existing")}
                    disabled={!customers.length}
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
                    <Label htmlFor="existingCustomerId">
                      Customer
                    </Label>
                    <input
                      id="existingCustomerId"
                      type="hidden"
                      {...register("existingCustomerId", { required: true })}
                    />
                    <CustomerSelect
                      customers={customers}
                      value={selectedCustomerId}
                      onChange={(customer) =>
                        setValue(
                          "existingCustomerId",
                          customer ? String(customer.id) : "",
                          { shouldDirty: true, shouldValidate: true }
                        )
                      }
                    />
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

              {submitSuccess && (
                <Alert>
                  <AlertDescription>{submitSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="min-w-[160px]"
                >
                  {formState.isSubmitting ? "Creating..." : "Create appointment"}
                </Button>
                <Button variant="ghost" type="button" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
