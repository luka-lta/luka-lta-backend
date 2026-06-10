import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import {AlertTriangle} from "lucide-react";
import {ReactNode} from "react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
}

function EmptyState({ title = 'No data', description = 'No data found', icon }: EmptyStateProps) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {icon ?? <AlertTriangle />}
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                {description && <EmptyDescription>{description}</EmptyDescription>}
            </EmptyHeader>
        </Empty>
    );
}

export default EmptyState;
