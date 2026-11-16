import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Boxes, Link2Off, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
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
import { formatUptime } from "@/feature/homelab/data.ts";
import { usageTone } from "@/feature/homelab/status.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { cn } from "@/lib/utils.ts";
import type { Host } from "@/feature/homelab/types.ts";
import type { InfraEdgeData, InfraNodeData, NodeStatus, TopologyGraph } from "@/feature/homelab/topology/types.ts";

interface NodeDetailSheetProps {
    node: InfraNodeData | null;
    host: Host | undefined;
    graph: TopologyGraph;
    onOpenChange: (open: boolean) => void;
    onOpenContainer: (containerId: string) => void;
}

const MANUAL_STATUSES: NodeStatus[] = ["healthy", "warning", "offline", "unknown"];

function Usage({ label, percent }: { label: string; percent: number }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-medium tabular-nums", usageTone(percent))}>
                    {percent.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %
                </span>
            </div>
            <Progress value={percent} className="h-1.5" aria-label={`${label}-Auslastung`} />
        </div>
    );
}

function HostMetrics({ host }: { host: Host }) {
    return (
        <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <Usage label="CPU" percent={host.cpuUsagePercent} />
                <Usage label="RAM" percent={host.memoryUsagePercent} />
            </div>
            <DetailList
                items={[
                    { label: "Uptime", value: formatUptime(host.uptimeSeconds) },
                    { label: "Load", value: <span className="tabular-nums">{host.loadAverage.join(" / ")}</span> },
                ]}
            />
        </div>
    );
}

function ReferenceInfo({ node, onOpenContainer }: { node: InfraNodeData; onOpenContainer: (id: string) => void }) {
    const ref = node.ref;
    if (!ref) {
        return (
            <p className="text-sm text-muted-foreground">
                Nicht mit Live-Daten verknüpft – der Status wird von Hand gepflegt.
            </p>
        );
    }

    const containerId = ref.containerId;

    return (
        <div className="space-y-3 text-sm">
            <DetailList
                items={[
                    { label: "Host", value: ref.hostName ?? ref.hostId },
                    { label: "Dienst", value: ref.serviceKey ?? "", mono: true, hidden: ref.serviceKey === null },
                ]}
            />
            {!ref.resolved && (
                <p className="flex items-center gap-1.5 text-xs text-warning">
                    <Link2Off className="size-3.5" aria-hidden />
                    {ref.type === "host" ? "Der verknüpfte Host" : "Der verknüpfte Dienst"} wird vom Agent gerade
                    nicht gemeldet.
                </p>
            )}
            {containerId && (
                <Button variant="outline" size="sm" onClick={() => onOpenContainer(containerId)}>
                    <Boxes />
                    Container-Details
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
    // Free-form types from proposals stay selectable even without an explicit config.
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
                onSuccess: () => toast.success("Knoten gespeichert"),
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                handleSave();
            }}
        >
            <div className="space-y-2">
                <Label htmlFor="node-edit-name">Name</Label>
                <Input id="node-edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="node-edit-type">Typ</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger id="node-edit-type">
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
                    <div className="space-y-2">
                        <Label htmlFor="node-edit-status">Status</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as NodeStatus)}>
                            <SelectTrigger id="node-edit-status">
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
            <Button type="submit" size="sm" disabled={!hasChanges || !name.trim() || updateNode.isPending}>
                Speichern
            </Button>
        </form>
    );
}

function NodeConnections({ node, graph }: { node: InfraNodeData; graph: TopologyGraph }) {
    const deleteEdge = useDeleteTopologyEdge();
    const [pendingEdge, setPendingEdge] = useState<InfraEdgeData | null>(null);
    const nameOf = (id: string) => graph.nodes.find((n) => n.id === id)?.name ?? id;
    const edges = graph.edges.filter((edge) => edge.sourceId === node.id || edge.targetId === node.id);

    if (edges.length === 0) {
        return <p className="text-sm text-muted-foreground">Noch keine Verbindungen.</p>;
    }

    const describe = (edge: InfraEdgeData) =>
        `${nameOf(edge.sourceId)} ${EDGE_RELATION_LABEL[edge.relation]} ${nameOf(edge.targetId)}`;

    return (
        <>
            <ul className="space-y-1">
                {edges.map((edge) => (
                    <li key={edge.id} className="flex items-center gap-2 text-sm">
                        <span className="truncate">
                            <span className={edge.sourceId === node.id ? "font-medium" : ""}>{nameOf(edge.sourceId)}</span>
                            <span className="text-muted-foreground"> {EDGE_RELATION_LABEL[edge.relation]} </span>
                            <span className={edge.targetId === node.id ? "font-medium" : ""}>{nameOf(edge.targetId)}</span>
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto size-7 shrink-0"
                            aria-label={`Verbindung entfernen: ${describe(edge)}`}
                            onClick={() => setPendingEdge(edge)}
                        >
                            <X />
                        </Button>
                    </li>
                ))}
            </ul>

            <ConfirmDialog
                open={pendingEdge !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingEdge(null);
                }}
                destructive
                title="Verbindung entfernen?"
                description={pendingEdge ? describe(pendingEdge) : ""}
                confirmLabel="Entfernen"
                isLoading={deleteEdge.isPending}
                onConfirm={() => {
                    if (!pendingEdge) return;
                    deleteEdge.mutate(pendingEdge.id, {
                        onSuccess: () => {
                            toast.success("Verbindung entfernt");
                            setPendingEdge(null);
                        },
                        onError: (error) => toast.error(getApiErrorMessage(error)),
                    });
                }}
            />
        </>
    );
}

function NodeDetailSheet({ node, host, graph, onOpenChange, onOpenContainer }: NodeDetailSheetProps) {
    const deleteNode = useDeleteTopologyNode();
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <Sheet open={node !== null} onOpenChange={onOpenChange}>
            <SheetContent side="right">
                {node && (
                    <>
                        <SheetHeader>
                            <div className="flex items-center gap-2 pr-6">
                                <SheetTitle>{node.name}</SheetTitle>
                                <span className={cn("size-2 rounded-full", STATUS_CONFIG[node.status].dotClass)} aria-hidden />
                                <span className="sr-only">Status: {STATUS_CONFIG[node.status].label}</span>
                            </div>
                            <SheetDescription>
                                {getNodeTypeConfig(node.type).label} · {STATUS_CONFIG[node.status].label}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
                            <ReferenceInfo node={node} onOpenContainer={onOpenContainer} />
                            {node.ref?.type === "host" && host && <HostMetrics host={host} />}

                            <Separator />
                            <EditNodeForm node={node} />

                            <Separator />
                            <div className="space-y-2">
                                <h3 className="text-base font-semibold">Verbindungen</h3>
                                <NodeConnections node={node} graph={graph} />
                            </div>

                            <div className="mt-auto border-t pt-4">
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setConfirmOpen(true)}
                                >
                                    <Trash2 />
                                    Knoten löschen
                                </Button>
                            </div>
                        </div>

                        <ConfirmDialog
                            open={confirmOpen}
                            onOpenChange={setConfirmOpen}
                            destructive
                            title="Knoten löschen?"
                            description={
                                <>
                                    <span className="font-medium text-foreground">{node.name}</span> und seine
                                    Verbindungen werden von der Karte entfernt.
                                </>
                            }
                            confirmLabel="Löschen"
                            isLoading={deleteNode.isPending}
                            onConfirm={() =>
                                deleteNode.mutate(node.id, {
                                    onSuccess: () => {
                                        toast.success("Knoten gelöscht");
                                        setConfirmOpen(false);
                                        onOpenChange(false);
                                    },
                                    onError: (error) => toast.error(getApiErrorMessage(error)),
                                })
                            }
                        />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default NodeDetailSheet;
