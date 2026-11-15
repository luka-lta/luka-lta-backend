import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Boxes, Link2Off, Trash2, X } from "lucide-react";
import {
    EDGE_RELATION_LABEL,
    getNodeTypeConfig,
    NODE_TYPE_CONFIG,
    STATUS_CONFIG,
} from "@/feature/homelab/topology/constants.ts";
import {
    useDeleteTopologyEdge,
    useDeleteTopologyNode,
    useUpdateTopologyNode,
} from "@/api/homelab/topologyHooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { formatUptime } from "@/feature/homelab/data.ts";
import type { Host } from "@/feature/homelab/types.ts";
import type { InfraNodeData, NodeStatus, TopologyGraph } from "@/feature/homelab/topology/types.ts";

interface NodeDetailSheetProps {
    node: InfraNodeData | null;
    host: Host | undefined;
    graph: TopologyGraph;
    onOpenChange: (open: boolean) => void;
    onOpenContainer: (containerId: string) => void;
}

const MANUAL_STATUSES: NodeStatus[] = ["healthy", "warning", "offline", "unknown"];

function HostMetrics({ host }: { host: Host }) {
    return (
        <div className="space-y-4 text-sm">
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
            <div className="grid grid-cols-2 gap-3">
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

function ReferenceInfo({ node, onOpenContainer }: { node: InfraNodeData; onOpenContainer: (id: string) => void }) {
    const ref = node.ref;
    if (!ref) {
        return <p className="text-xs text-muted-foreground">Not linked to live data — status is maintained manually.</p>;
    }

    const containerId = ref.containerId;

    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Host</span>
                <span className="font-medium">{ref.hostName ?? ref.hostId}</span>
            </div>
            {ref.serviceKey && (
                <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Service</span>
                    <code className="text-xs">{ref.serviceKey}</code>
                </div>
            )}
            {!ref.resolved && (
                <p className="flex items-center gap-1.5 text-xs text-amber-500">
                    <Link2Off className="h-3.5 w-3.5" />
                    The linked {ref.type} is currently not reported by the agent.
                </p>
            )}
            {containerId && (
                <Button variant="outline" size="sm" onClick={() => onOpenContainer(containerId)}>
                    <Boxes className="h-3.5 w-3.5" />
                    Container details
                </Button>
            )}
        </div>
    );
}

function EditNodeForm({ node }: { node: InfraNodeData }) {
    const [name, setName] = useState(node.name);
    const [type, setType] = useState(node.type);
    const [status, setStatus] = useState<NodeStatus>(node.status);
    const updateNode = useUpdateTopologyNode();

    useEffect(() => {
        setName(node.name);
        setType(node.type);
        setStatus(node.status);
    }, [node.id, node.name, node.type, node.status]);

    const isLinked = node.ref !== null;
    // Free-form types from proposals are kept selectable even if they have no explicit config.
    const typeOptions = NODE_TYPE_CONFIG[node.type]
        ? Object.keys(NODE_TYPE_CONFIG)
        : [node.type, ...Object.keys(NODE_TYPE_CONFIG)];
    const hasChanges = name.trim() !== node.name || type !== node.type || (!isLinked && status !== node.status);

    function handleSave() {
        updateNode.mutate(
            {
                nodeId: node.id,
                data: { name: name.trim(), type, ...(isLinked ? {} : { status }) },
            },
            {
                onSuccess: () => toast.success("Node updated."),
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <div className="grid gap-3">
            <div className="grid gap-1.5">
                <Label htmlFor="node-edit-name">Name</Label>
                <Input id="node-edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((key) => (
                                <SelectItem key={key} value={key}>
                                    {getNodeTypeConfig(key).label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {!isLinked && (
                    <div className="grid gap-1.5">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as NodeStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MANUAL_STATUSES.map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {STATUS_CONFIG[key].label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            <Button
                size="sm"
                className="justify-self-start"
                disabled={!hasChanges || !name.trim() || updateNode.isPending}
                onClick={handleSave}
            >
                Save
            </Button>
        </div>
    );
}

function NodeConnections({ node, graph }: { node: InfraNodeData; graph: TopologyGraph }) {
    const deleteEdge = useDeleteTopologyEdge();
    const nameOf = (id: string) => graph.nodes.find((n) => n.id === id)?.name ?? id;
    const edges = graph.edges.filter((edge) => edge.sourceId === node.id || edge.targetId === node.id);

    if (edges.length === 0) {
        return <p className="text-xs text-muted-foreground">No connections yet.</p>;
    }

    return (
        <ul className="space-y-1">
            {edges.map((edge) => (
                <li key={edge.id} className="flex items-center gap-2 text-xs">
                    <span className="truncate">
                        <span className={edge.sourceId === node.id ? "font-medium" : ""}>{nameOf(edge.sourceId)}</span>
                        <span className="text-muted-foreground"> {EDGE_RELATION_LABEL[edge.relation]} </span>
                        <span className={edge.targetId === node.id ? "font-medium" : ""}>{nameOf(edge.targetId)}</span>
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6 shrink-0"
                        aria-label="Remove connection"
                        disabled={deleteEdge.isPending}
                        onClick={() =>
                            deleteEdge.mutate(edge.id, {
                                onSuccess: () => toast.success("Connection removed."),
                                onError: (error) => toast.error(getApiErrorMessage(error)),
                            })
                        }
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </li>
            ))}
        </ul>
    );
}

function NodeDetailSheet({ node, host, graph, onOpenChange, onOpenContainer }: NodeDetailSheetProps) {
    const deleteNode = useDeleteTopologyNode();

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
                                {getNodeTypeConfig(node.type).label} · {STATUS_CONFIG[node.status].label}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-5 pt-2">
                            <ReferenceInfo node={node} onOpenContainer={onOpenContainer} />
                            {node.ref?.type === "host" && host && <HostMetrics host={host} />}

                            <Separator />
                            <EditNodeForm node={node} />

                            <Separator />
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Connections</p>
                                <NodeConnections node={node} graph={graph} />
                            </div>

                            <Separator />
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteNode.isPending}
                                onClick={() =>
                                    deleteNode.mutate(node.id, {
                                        onSuccess: () => {
                                            toast.success("Node deleted.");
                                            onOpenChange(false);
                                        },
                                        onError: (error) => toast.error(getApiErrorMessage(error)),
                                    })
                                }
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete node
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default NodeDetailSheet;
