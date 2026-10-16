"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/table";
import { getAppLayout } from "@/components/app-layout";
import { StatusBadge } from "@/components/status-badge";
import { apiFetch } from "@/lib/client/api-fetch";
import { useTranslation } from "@/i18n/use-translation";
import type {
  BookingsListResponse,
  CreatedAppointment,
} from "@/types/appointments";
import type { ApiErrorResponse } from "@/types/api";
import type { UseTranslationResult } from "@/types/i18n";
import type { TableColumn, TableRow } from "@/types/table";

const getBookingColumns = (
  t: UseTranslationResult["t"],
): TableColumn[] => [
  { key: "id", header: t("bookings.columns.id") },
  { key: "customerName", header: t("bookings.columns.customer") },
  { key: "customerEmail", header: t("bookings.columns.email") },
  { key: "serviceName", header: t("bookings.columns.service") },
  { key: "start", header: t("bookings.columns.start") },
  { key: "end", header: t("bookings.columns.end") },
  { key: "status", header: t("bookings.columns.status") },
  { key: "paymentStatus", header: t("bookings.columns.payment") },
  { key: "price", header: t("bookings.columns.price"), align: "right" },
];

const readApiJson = async <T,>(response: Response) => {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
};

const toTableRows = (
  bookings: CreatedAppointment[],
  { formatCurrency, formatDateTime }: UseTranslationResult,
): TableRow[] => {
  return bookings.map((booking) => ({
    id: booking.id ?? "-",
    customerName: booking.customer?.name ?? "-",
    customerEmail: booking.customer?.email ?? "-",
    serviceName: booking.service?.name ?? "-",
    start: formatDateTime(booking.start),
    end: formatDateTime(booking.end),
    status: <StatusBadge status={booking.status?.name} />,
    paymentStatus: <StatusBadge status={booking.paymentStatus?.name} />,
    price: formatCurrency(booking.service?.price),
  }));
};

export default function BookingsPage() {
  const i18n = useTranslation();
  const { t, tm } = i18n;
  const [bookings, setBookings] = useState<CreatedAppointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableRows = useMemo(() => toTableRows(bookings, i18n), [bookings, i18n]);
  const bookingColumns = useMemo(() => getBookingColumns(t), [t]);

  useEffect(() => {
    const controller = new AbortController();

    const loadBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
        });

        const response = await apiFetch(`/api/bookings?${searchParams}`, {
          signal: controller.signal,
        });
        const data = await readApiJson<BookingsListResponse & ApiErrorResponse>(
          response,
        );

        if (!response.ok) {
          throw new Error(tm(data?.message) || t("bookings.loadError"));
        }

        setBookings(data.bookings ?? []);
        setTotalRows(data.totalRows ?? 0);
        setTotalPages(Math.max(data.totalPages ?? 1, 1));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Error loading bookings", error);
        setBookings([]);
        setTotalRows(0);
        setTotalPages(1);
        setError(
          error instanceof Error ? error.message : t("bookings.loadError"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      controller.abort();
    };
  }, [currentPage, limit, t, tm]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t("bookings.title")}
        </h1>

        <Card>
          <CardContent className="space-y-4 pt-6">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("bookings.loading")}
              </p>
            ) : null}

            <Table
              totalRows={totalRows}
              totalPages={totalPages}
              currentPage={currentPage}
              limit={limit}
              columns={bookingColumns}
              data={tableRows.map((row) => ({
                ...row,
                customerName: (
                  <p className="font-medium text-primary">{row.customerName}</p>
                ),
              }))}
              setLimit={(nextLimit) => {
                setLimit(nextLimit);
                setCurrentPage(1);
              }}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

BookingsPage.getLayout = getAppLayout;
