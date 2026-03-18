import { CalendarClock, CircleDollarSign, ClipboardCheck, UserRound } from "lucide-react";
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

export function AppointmentSummary({ appointment }: AppointmentSummaryProps) {
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Appointment created successfully</CardTitle>
            <CardDescription>Resumo completo do agendamento retornado pela API.</CardDescription>
          </div>
          <Badge className="px-3 py-1">ID {appointment.id}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-background/80 p-4 space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Horario
            </p>
            <p className="text-sm">
              <span className="font-semibold">Inicio:</span> {formatDateTime(appointment.start)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Fim:</span> {formatDateTime(appointment.end)}
            </p>
          </div>

          <div className="rounded-xl border bg-background/80 p-4 space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Status
            </p>
            <p className="text-sm">
              <span className="font-semibold">Agendamento:</span> {appointment.status.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Pagamento:</span> {appointment.paymentStatus.name}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-background/80 p-4 space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              Servico
            </p>
            <p className="font-semibold">{appointment.service.name}</p>
            <p className="text-sm">
              {appointment.service.duration} min •{" "}
              {currencyFormatter.format(appointment.service.price)}
            </p>
            <p className="text-sm text-muted-foreground">
              {appointment.service.description?.trim() || "Sem descricao"}
            </p>
            <p className="text-xs text-muted-foreground">
              Profissional: {appointment.service.user.name} ({appointment.service.user.email})
            </p>
          </div>

          <div className="rounded-xl border bg-background/80 p-4 space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Cliente
            </p>
            <p className="font-semibold">{appointment.customer.name}</p>
            <p className="text-sm">{appointment.customer.email}</p>
            <p className="text-sm">{appointment.customer.phone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
