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
            <div className="flex h-6 items-center gap-1.5 px-2.5 text-[11px] font-medium leading-none text-muted-foreground">
                <Server className="size-3" aria-hidden />
                <span className="truncate">{data.label}</span>
                <span className={cn("size-1.5 shrink-0 rounded-full", statusConfig.dotClass)} aria-label={statusConfig.label} />
            </div>
            <Handle type="source" position={Position.Right} className="!bg-border" />
        </div>
    );
}

export default HostGroupNode;
