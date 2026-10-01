import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";

export function SortableHead<TData>({
  column,
  children,
  className,
}: {
  column: Column<TData, unknown>;
  children: React.ReactNode;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <TableHead
      className={cn("cursor-pointer select-none", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span className="flex items-center gap-1">
        {children}
        {sorted === "asc" ? (
          <ArrowUp className="size-3" />
        ) : sorted === "desc" ? (
          <ArrowDown className="size-3" />
        ) : (
          <ArrowUpDown className="size-3 opacity-30" />
        )}
      </span>
    </TableHead>
  );
}
