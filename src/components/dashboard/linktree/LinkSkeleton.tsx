import {TableCell, TableRow} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton.tsx";

function LinkSkeleton() {
    return (
        <TableRow className="animate-pulse">
            <TableCell>
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-20 h-5" />
                </div>
            </TableCell>
            <TableCell>
                <Skeleton className="w-2/3 h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="w-1/2 h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="w-16 h-5" />
            </TableCell>
            <TableCell>
                <Skeleton className="w-24 h-5" />
            </TableCell>
            <TableCell>
                <div className="flex space-x-2">
                    <Skeleton className="w-16 h-8" />
                    <Skeleton className="w-16 h-8" />
                </div>
            </TableCell>
        </TableRow>
    );
}

export default LinkSkeleton;