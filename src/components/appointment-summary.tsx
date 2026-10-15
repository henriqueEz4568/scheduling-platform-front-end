import {
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import type { CreatedAppointment } from "@/types/appointments";
import { useTranslation } from "@/i18n/use-translation";

type AppointmentSummaryProps = {
  appointment: CreatedAppointment;
};

const hasText = (value?: string | number | null) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export function AppointmentSummary({ appointment }: AppointmentSummaryProps) {
  const { t, tm, formatCurrency, formatDateTime } = useTranslation();
  const formatOptionalDateTime = (value?: string) => {
    const formatted = formatDateTime(value);
    return formatted === "-" ? null : formatted;
  };
  const translateStatus = (name?: string) =>
    name ? tm(`status.${name}`).replace(/^status\./, "") : "";
  const start = formatOptionalDateTime(appointment.start);
  const end = formatOptionalDateTime(appointment.end);
  const service = appointment.service;
  const customer = appointment.customer;
  const professional = service?.user;
  const serviceDescription = service?.description?.trim();
  const hasSchedule = Boolean(start || end);
  const hasStatus = Boolean(
    hasText(appointment.status?.name) || hasText(appointment.paymentStatus?.name),
  );
  const hasService = Boolean(
    hasText(service?.name) ||
      typeof service?.duration === "number" ||
      typeof service?.price === "number" ||
      hasText(serviceDescription) ||
      hasText(professional?.name) ||
      hasText(professional?.email) ||
      hasText(professional?.role),
  );
  const hasCustomer = Boolean(
    hasText(customer?.name) || hasText(customer?.email) || hasText(customer?.phone),
  );

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">
              {t("appointmentSummary.title")}
            </CardTitle>
            <CardDescription>
              {t("appointmentSummary.description")}
            </CardDescription>
          </div>
          {hasText(appointment.id) ? (
            <Badge className="px-3 py-1">
              {t("appointmentSummary.id", { id: appointment.id ?? "" })}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasSchedule || hasStatus ? (
          <div className="grid gap-4 md:grid-cols-2">
            {hasSchedule ? (
              <div className="rounded-xl border bg-background/80 p-4 space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {t("appointmentSummary.schedule")}
                </p>
                {start ? (
                  <p className="text-sm">
                    <span className="font-semibold">
                      {t("appointmentSummary.start")}
                    </span>{" "}
                    {start}
                  </p>
                ) : null}
                {end ? (
                  <p className="text-sm">
                    <span className="font-semibold">
                      {t("appointmentSummary.end")}
                    </span>{" "}
                    {end}
                  </p>
                ) : null}
              </div>
            ) : null}

            {hasStatus ? (
              <div className="rounded-xl border bg-background/80 p-4 space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  {t("appointmentSummary.status")}
                </p>
                {hasText(appointment.status?.name) ? (
                  <p className="text-sm">
                    <span className="font-semibold">
                      {t("appointmentSummary.booking")}
                    </span>{" "}
                    {translateStatus(appointment.status?.name)}
                  </p>
                ) : null}
                {hasText(appointment.paymentStatus?.name) ? (
                  <p className="text-sm">
                    <span className="font-semibold">
                      {t("appointmentSummary.payment")}
                    </span>{" "}
                    {translateStatus(appointment.paymentStatus?.name)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasService || hasCustomer ? (
          <div className="grid gap-4 md:grid-cols-2">
            {hasService ? (
              <div className="rounded-xl border bg-background/80 p-4 space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" />
                  {t("appointmentSummary.service")}
                </p>
                {hasText(service?.name) ? (
                  <p className="font-semibold">{service?.name}</p>
                ) : null}
                {typeof service?.duration === "number" ||
                typeof service?.price === "number" ? (
                  <p className="text-sm">
                    {typeof service.duration === "number"
                      ? t("common.minutes", { count: service.duration })
                      : null}
                    {typeof service.duration === "number" &&
                    typeof service.price === "number"
                      ? " • "
                      : null}
                    {typeof service.price === "number"
                      ? formatCurrency(service.price)
                      : null}
                  </p>
                ) : null}
                {hasText(serviceDescription) ? (
                  <p className="text-sm text-muted-foreground">
                    {serviceDescription}
                  </p>
                ) : null}
                {hasText(professional?.name) ||
                hasText(professional?.email) ||
                hasText(professional?.role) ? (
                  <p className="text-xs text-muted-foreground">
                    {t("appointmentSummary.professional")}{" "}
                    {[professional?.name, professional?.email, professional?.role]
                      .filter(hasText)
                      .join(" - ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {hasCustomer ? (
              <div className="rounded-xl border bg-background/80 p-4 space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {t("appointmentSummary.customer")}
                </p>
                {hasText(customer?.name) ? (
                  <p className="font-semibold">{customer?.name}</p>
                ) : null}
                {hasText(customer?.email) ? (
                  <p className="text-sm">{customer?.email}</p>
                ) : null}
                {hasText(customer?.phone) ? (
                  <p className="text-sm">{customer?.phone}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
