import type { ReactNode } from "react";

export type TableRow = Record<string, ReactNode> & {
  className?: string;
};

export type TableColumn = {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

export type TableProps = {
  totalRows: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  columns: TableColumn[];
  data?: TableRow[];
  setLimit: (limit: number) => void;
  onPageChange: (page: number) => void;
};
