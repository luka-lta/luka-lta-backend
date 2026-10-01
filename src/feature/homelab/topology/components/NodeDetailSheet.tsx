import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Trash2 } from "lucide-react";
import { getNodeTypeConfig, NODE_TYPE_CONFIG, STATUS_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { useDeleteTopologyNode, useUpdateHostNodeType } from "@/api/homelab/topologyHooks.ts";
import { formatUptime } from "@/feature/homelab/data.ts";
import type { Host } from "@/feature/homelab/types.ts";
import type { InfraNodeData } from "@/feature/homelab/topology/types.ts";

interface NodeDetailSheetProps {
    node: InfraNodeData | null;
    host: Host | undefined;
    onOpenChange: (open: boolean) => void;
}

function HostDetails({ node, host }: { node: InfraNodeData; host: Host }) {
    const updateNodeType = useUpdateHostNodeType();

    return (
        <div className="space-y-4 pt-4 text-sm">
            <div>
                <p className="font-medium mb-1.5">Node type</p>
                <Select
                    value={node.type}
                    onValueChange={(value) =>
                        updateNodeType.mutate(
                            { hostId: node.id, nodeType: value },
                            { onSuccess: () => toast.success("Node type updated.") },
                        )
                    }
                >
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(NODE_TYPE_CONFIG)
                            .filter(([, config]) => config.category === "infrastructure")
                            .map(([type, config]) => (
                                <SelectItem key={type} value={type}>
                                    {config.label}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">CPU</span>
                        <span className="font-medium tabular-nums">{host.cpuUsagePercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={host.cpuUsagePercent} className="h-1.5" />
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="font-medium tabular-nums">{host.memoryUsagePercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={host.memoryUsagePercent} className="h-1.5" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-muted-foreground text-xs">Uptime</p>
                    <p className="font-medium">{formatUptime(host.uptimeSeconds)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Load average</p>
                    <p className="font-medium">{host.loadAverage.join(" / ")}</p>
                </div>
            </div>
        </div>
    );
}

function ManualNodeDetails({ node, onOpenChange }: { node: InfraNodeData; onOpenChange: (open: boolean) => void }) {
    const deleteNode = useDeleteTopologyNode();
    const metadataEntries = Object.entries(node.metadata);

    return (
        <div className="space-y-4 pt-4 text-sm">
            {metadataEntries.length > 0 && (
                <div>
                    <p className="font-medium mb-1.5">Metadata</p>
                    <div className="flex flex-col gap-1">
                        {metadataEntries.map(([key, value]) => (
                            <div key={key} className="flex justify-between gap-4 text-xs font-mono">
                                <span className="text-muted-foreground">{key}</span>
                                <span>{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Button
                variant="destructive"
                size="sm"
                disabled={deleteNode.isPending}
                onClick={() => {
                    deleteNode.mutate(node.id, {
                        onSuccess: () => {
                            toast.success("Node deleted.");
                            onOpenChange(false);
                        },
                        onError: (error) => toast.error(error.message),
                    });
                }}
            >
                <Trash2 className="h-3.5 w-3.5" />
                Delete node
            </Button>
        </div>
    );
}

function NodeDetailSheet({ node, host, onOpenChange }: NodeDetailSheetProps) {
    return (
        <Sheet open={node !== null} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                {node && (
                    <>
                        <SheetHeader className="px-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-xl">{node.name}</SheetTitle>
                                <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[node.status].dotClass}`} />
                            </div>
                            <SheetDescription>
                                {getNodeTypeConfig(node.type).label}
                                {node.manual ? " · manually added" : ""}
                            </SheetDescription>
                        </SheetHeader>

                        {node.source === "host" && host && <HostDetails node={node} host={host} />}
                        {node.manual && <ManualNodeDetails node={node} onOpenChange={onOpenChange} />}
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default NodeDetailSheet;
