import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";
import { cn } from "@/lib/utils";
import type { TableProps } from "@/types/table";

const renderCellValue = (value: ReactNode): ReactNode => {
  if (!value) {
    return "-";
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return value;
};

export function Table({
  totalRows,
  totalPages,
  currentPage,
  limit,
  columns,
  data,
  setLimit,
  onPageChange,
}: TableProps) {
  const { t } = useTranslation();
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap bg-[#343335] px-4 py-3 font-semibold text-white",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {data && data?.length > 0 ? (
              data?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    row.className,
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-foreground",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {renderCellValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t bg-background px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {t("table.page")}{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            {t("table.of")}{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
            <span className="ml-2">
              {t("table.records", { count: totalRows })}
            </span>
          </p>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("table.perPage")}</span>
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {[10, 15, 30].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPreviousDisabled}
            onClick={() => onPageChange(currentPage - 1)}
          >
            {t("table.previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isNextDisabled}
            onClick={() => onPageChange(currentPage + 1)}
          >
            {t("table.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
