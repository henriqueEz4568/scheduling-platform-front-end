"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table } from "@/components/table";
import { apiFetch } from "@/lib/client/api-fetch";
import { formatCurrency, formatDateTime } from "@/utils";
import type {
  BookingsListResponse,
  CreatedAppointment,
} from "@/types/appointments";
import type { ApiErrorResponse } from "@/types/api";
import type { TableColumn, TableRow } from "@/types/table";

const bookingColumns: TableColumn[] = [
  { key: "id", header: "ID" },
  { key: "customerName", header: "Cliente" },
  { key: "customerEmail", header: "Email" },
  { key: "serviceName", header: "Serviço" },
  { key: "start", header: "Início" },
  { key: "end", header: "Fim" },
  { key: "status", header: "Status" },
  { key: "paymentStatus", header: "Pagamento" },
  { key: "price", header: "Valor", align: "right" },
];

const readApiJson = async <T,>(response: Response) => {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
};

const toTableRows = (bookings: CreatedAppointment[]): TableRow[] => {
  return bookings.map((booking) => ({
    id: booking.id ?? "-",
    customerName: booking.customer?.name ?? "-",
    customerEmail: booking.customer?.email ?? "-",
    serviceName: booking.service?.name ?? "-",
    start: formatDateTime(booking.start),
    end: formatDateTime(booking.end),
    status: booking.status?.name ?? "-",
    paymentStatus: booking.paymentStatus?.name ?? "-",
    price: formatCurrency(booking.service?.price),
  }));
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<CreatedAppointment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableRows = useMemo(() => toTableRows(bookings), [bookings]);

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
          throw new Error(data?.message ?? "Unable to load bookings.");
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
          error instanceof Error ? error.message : "Unable to load bookings.",
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
  }, [currentPage, limit]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Agendamentos
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Lista de bookings
            </h1>
            <p className="text-muted-foreground">
              Acompanhe os agendamentos retornados pela API.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/new-appointment">
                <Plus className="h-4 w-4" />
                Novo agendamento
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              Página {currentPage} com até {limit} registros por busca.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Carregando bookings...
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
                className: "bg-[#8d98a344]",
                customerName: (
                  <p className="text-blue-700">{row.customerName}</p>
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
