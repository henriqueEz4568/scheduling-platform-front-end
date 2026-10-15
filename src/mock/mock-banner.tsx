import { useTranslation } from "@/i18n/use-translation";

export function MockBanner() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-foreground py-1 text-center text-xs font-medium text-background"
    >
      {t("mock.banner")}
    </div>
  );
}
