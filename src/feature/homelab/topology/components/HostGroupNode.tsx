import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { STATUS_CONFIG } from "@/feature/homelab/topology/constants.ts";
import type { HostGroupFlowNode } from "@/feature/homelab/topology/layout.ts";

/** Frame around the services of one host; stands in for the host node when it exists. */
function HostGroupNode({ data }: NodeProps<HostGroupFlowNode>) {
    const statusConfig = STATUS_CONFIG[data.status];

    return (
        <div
            className={cn(
                "h-full w-full rounded-xl border border-dashed bg-muted/20 transition-opacity",
                data.node && "cursor-pointer",
                data.dimmed && "opacity-30",
            )}
        >
            <Handle type="target" position={Position.Left} className="!bg-border" />
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
                <Server className="h-3.5 w-3.5" />
                <span className="truncate">{data.label}</span>
                <span className={cn("h-2 w-2 shrink-0 rounded-full", statusConfig.dotClass)} />
            </div>
            <Handle type="source" position={Position.Right} className="!bg-border" />
        </div>
    );
}

export default HostGroupNode;
