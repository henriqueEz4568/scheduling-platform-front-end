import { CalendarClock, Timer, UserCheck, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import type { CreatedService } from "@/types/services";
import { useTranslation } from "@/i18n/use-translation";

type ServiceSummaryProps = {
  service: CreatedService;
};

export function ServiceSummary({ service }: ServiceSummaryProps) {
  const { t, formatCurrency, formatDateTime } = useTranslation();

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {service.name}
            </CardTitle>
            <CardDescription>{t("serviceSummary.description")}</CardDescription>
          </div>
          <Badge className="px-4 py-1 text-sm">
            {t("serviceSummary.id", { id: service.dbId })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-2xl bg-background/80 border shadow-inner flex items-center gap-3">
            <Timer className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("serviceSummary.duration")}
              </p>
              <p className="text-lg font-semibold">
                {t("common.minutes", { count: service.duration })}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-background/80 border shadow-inner flex items-center gap-3">
            <Wallet className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("serviceSummary.price")}
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(service.price)}
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-background/80 border shadow-inner flex items-center gap-3">
            <CalendarClock className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                {t("serviceSummary.createdAt")}
              </p>
              <p className="text-lg font-semibold">
                {formatDateTime(service.created)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background/80 p-5 space-y-3">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {t("serviceSummary.descriptionLabel")}
          </p>
          <p className="text-base leading-relaxed text-foreground">
            {service.description?.trim() || t("serviceSummary.noDescription")}
          </p>
        </div>

        <div className="rounded-2xl border bg-background/80 p-5 flex flex-wrap items-center gap-4">
          <UserCheck className="h-10 w-10 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              {t("serviceSummary.owner")}
            </p>
            <p className="font-semibold text-lg">{service.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {service.user.email} • {service.user.role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
