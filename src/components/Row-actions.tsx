import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

interface RowActionsProps {
    rowsPerPage: number;
    totalRows: number;
}

function RowActions({ rowsPerPage, totalRows }: RowActionsProps) {
    return (
        <div className="flex items-center justify-between text-gray-500 text-sm">
            <p>Total rows: {totalRows}</p>
            <div className="flex items-center gap-2">
                <p>Rows per page:</p>
                <Select>
                    <SelectTrigger className="w-15">
                        <SelectValue defaultValue={rowsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default RowActions;
