import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { getNodeTypeConfig, STATUS_CONFIG } from "@/feature/homelab/topology/constants.ts";
import type { InfraNodeData } from "@/feature/homelab/topology/types.ts";

type InfraNodeFlowData = InfraNodeData & { dimmed?: boolean };

function InfraNode({ data, selected }: NodeProps & { data: InfraNodeFlowData }) {
    const typeConfig = getNodeTypeConfig(data.type);
    const statusConfig = STATUS_CONFIG[data.status];
    const Icon = typeConfig.icon;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm transition-shadow",
                        "min-w-[180px] max-w-[220px] ring-2",
                        statusConfig.ringClass,
                        selected && "border-primary shadow-md",
                        data.dimmed && "opacity-30",
                    )}
                >
                    <Handle type="target" position={Position.Top} className="!bg-border" />
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium">{data.name}</span>
                    <span className={cn("ml-auto h-2 w-2 shrink-0 rounded-full", statusConfig.dotClass)} />
                    <Handle type="source" position={Position.Bottom} className="!bg-border" />
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
                <div className="font-medium">{data.name}</div>
                <div className="text-muted-foreground">
                    {typeConfig.label} · {statusConfig.label}
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

export default InfraNode;
