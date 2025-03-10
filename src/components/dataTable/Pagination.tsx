import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PagerProps {
    page: number,
    rowsPerPage: number;
    maxPages: number;
    onUpdatePagination: (page: number, pageSize: number) => void;
}

function Pagination({ onUpdatePagination, page, rowsPerPage, maxPages }: PagerProps) {
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select value={rowsPerPage.toString()} onValueChange={(value) => onUpdatePagination(page, Number(value))}>
                    <SelectTrigger className="w-[70px]">
                        <SelectValue>{rowsPerPage}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">Page {page} of {maxPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdatePagination(1, rowsPerPage)}
                    disabled={page === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdatePagination(--page, rowsPerPage)}
                    disabled={page === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdatePagination(++page, rowsPerPage)}
                    disabled={page === maxPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdatePagination(maxPages, rowsPerPage)}
                    disabled={page === maxPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default Pagination;