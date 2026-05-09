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
import { formatDateTime } from "@/lib/utils";

type AppointmentSummaryProps = {
  appointment: CreatedAppointment;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const safeFormatDateTime = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatDateTime(value);
};

const hasText = (value?: string | number | null) => {
  return value !== undefined && value !== null && String(value).trim() !== "";
};

export function AppointmentSummary({ appointment }: AppointmentSummaryProps) {
  const start = safeFormatDateTime(appointment.start);
  const end = safeFormatDateTime(appointment.end);
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
              Agendamento criado com sucesso
            </CardTitle>
            <CardDescription>
              Resumo completo do agendamento retornado pela API.
            </CardDescription>
          </div>
          {hasText(appointment.id) ? (
            <Badge className="px-3 py-1">ID {appointment.id}</Badge>
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
                  Horario
                </p>
                {start ? (
                  <p className="text-sm">
                    <span className="font-semibold">Inicio:</span> {start}
                  </p>
                ) : null}
                {end ? (
                  <p className="text-sm">
                    <span className="font-semibold">Fim:</span> {end}
                  </p>
                ) : null}
              </div>
            ) : null}

            {hasStatus ? (
              <div className="rounded-xl border bg-background/80 p-4 space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Status
                </p>
                {hasText(appointment.status?.name) ? (
                  <p className="text-sm">
                    <span className="font-semibold">Agendamento:</span>{" "}
                    {appointment.status?.name}
                  </p>
                ) : null}
                {hasText(appointment.paymentStatus?.name) ? (
                  <p className="text-sm">
                    <span className="font-semibold">Pagamento:</span>{" "}
                    {appointment.paymentStatus?.name}
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
                  Servico
                </p>
                {hasText(service?.name) ? (
                  <p className="font-semibold">{service?.name}</p>
                ) : null}
                {typeof service?.duration === "number" ||
                typeof service?.price === "number" ? (
                  <p className="text-sm">
                    {typeof service.duration === "number"
                      ? `${service.duration} min`
                      : null}
                    {typeof service.duration === "number" &&
                    typeof service.price === "number"
                      ? " • "
                      : null}
                    {typeof service.price === "number"
                      ? currencyFormatter.format(service.price)
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
                    Profissional:{" "}
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
                  Cliente
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
