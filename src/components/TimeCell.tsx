import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { formatAbs, formatAbsFull, formatRel } from "@/lib/dateTimeUtils.ts";

interface TimeCellProps {
    iso: string;
    full?: boolean;
}

export function TimeCell({ iso, full = false }: TimeCellProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground cursor-default tabular-nums">
                        {formatRel(iso)}
                    </span>
                </TooltipTrigger>
                <TooltipContent>{full ? formatAbsFull(iso) : formatAbs(iso)}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
