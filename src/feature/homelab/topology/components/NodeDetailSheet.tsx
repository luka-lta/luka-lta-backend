import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { getNodeTypeConfig, NODE_TYPE_CONFIG, STATUS_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { useDeleteTopologyNode, useUpdateHostNodeType } from "@/api/homelab/topologyHooks.ts";
import { formatUptime } from "@/feature/homelab/data.ts";
import { usageTone } from "@/feature/homelab/status.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { cn } from "@/lib/utils.ts";
import type { Host } from "@/feature/homelab/types.ts";
import type { InfraNodeData } from "@/feature/homelab/topology/types.ts";

interface NodeDetailSheetProps {
    node: InfraNodeData | null;
    host: Host | undefined;
    onOpenChange: (open: boolean) => void;
}

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

function HostDetails({ node, host }: { node: InfraNodeData; host: Host }) {
    const updateNodeType = useUpdateHostNodeType();

    return (
        <div className="space-y-5 text-sm">
            <div className="space-y-2">
                <Label htmlFor="host-node-type">Knotentyp</Label>
                <Select
                    value={node.type}
                    disabled={updateNodeType.isPending}
                    onValueChange={(value) =>
                        updateNodeType.mutate(
                            { hostId: node.id, nodeType: value },
                            {
                                onSuccess: () => toast.success("Knotentyp gespeichert"),
                                onError: (error) => toast.error(getApiErrorMessage(error)),
                            },
                        )
                    }
                >
                    <SelectTrigger id="host-node-type" className="w-56">
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

function ManualNodeDetails({ node, onOpenChange }: { node: InfraNodeData; onOpenChange: (open: boolean) => void }) {
    const deleteNode = useDeleteTopologyNode();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const metadataEntries = Object.entries(node.metadata);

    return (
        <div className="flex flex-1 flex-col gap-5 text-sm">
            {metadataEntries.length > 0 ? (
                <DetailList items={metadataEntries.map(([key, value]) => ({ label: key, value: String(value), mono: true }))} />
            ) : (
                <p className="text-muted-foreground">Keine Metadaten hinterlegt.</p>
            )}

            <div className="mt-auto border-t pt-4">
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 />
                    Knoten löschen
                </Button>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                destructive
                title="Knoten löschen?"
                description={
                    <>
                        <span className="font-medium text-foreground">{node.name}</span> und seine Verbindungen werden von der
                        Karte entfernt.
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
        </div>
    );
}

function NodeDetailSheet({ node, host, onOpenChange }: NodeDetailSheetProps) {
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
                                {node.manual ? " · manuell angelegt" : ""}
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
