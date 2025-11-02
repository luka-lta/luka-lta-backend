import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {AlertTriangle} from "lucide-react";

function EmptyState() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <AlertTriangle />
                </EmptyMedia>
                <EmptyTitle>No data</EmptyTitle>
                <EmptyDescription>No data found</EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

export default EmptyState;