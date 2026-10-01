import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages?: number;
  rowCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, rowCount, isLoading, onPageChange }: PaginationProps) {
  const hasMultiplePages = (totalPages ?? 1) > 1;

  return (
    <div className="flex items-center justify-between border-t px-6 py-3">
      <p className="text-sm text-muted-foreground">
        {rowCount === 0
          ? "No results"
          : hasMultiplePages
            ? `Page ${page} of ${totalPages}`
            : `${rowCount.toLocaleString()} result${rowCount !== 1 ? "s" : ""}`}
      </p>
      {hasMultiplePages && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= (totalPages ?? 1) || isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
