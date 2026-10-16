import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/use-translation";
import { getStatusVariant } from "@/lib/status";
import type { StatusBadgeProps } from "@/types/status";

export function StatusBadge({ status, icon, className }: StatusBadgeProps) {
  const { tm } = useTranslation();

  if (!status) {
    return <>-</>;
  }

  const label = tm(`status.${status}`).replace(/^status\./, "");

  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {icon}
      {label}
    </Badge>
  );
}
