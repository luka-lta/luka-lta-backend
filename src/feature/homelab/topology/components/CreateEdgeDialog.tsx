import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label.tsx";
import { FormDialog } from "@/components/dialogs/form-dialog.tsx";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { EDGE_RELATION_LABEL } from "@/feature/homelab/topology/constants.ts";
import { useCreateTopologyEdge } from "@/api/homelab/topologyHooks.ts";
import type { EdgeRelation, InfraNodeData } from "@/feature/homelab/topology/types.ts";

interface CreateEdgeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodes: InfraNodeData[];
}

const RELATIONS: EdgeRelation[] = ["connects_to", "routes_to", "depends_on", "exposes", "hosted_on"];

function entityTypeOf(node: InfraNodeData): "host" | "container" | "node" {
    return node.source ?? "node";
}

function CreateEdgeDialog({ open, onOpenChange, nodes }: CreateEdgeDialogProps) {
    const [sourceId, setSourceId] = useState<string>("");
    const [targetId, setTargetId] = useState<string>("");
    const [relation, setRelation] = useState<EdgeRelation>("connects_to");
    const createEdge = useCreateTopologyEdge();

    function handleSubmit() {
        const source = nodes.find((n) => n.id === sourceId);
        const target = nodes.find((n) => n.id === targetId);
        if (!source || !target) return;

        createEdge.mutate(
            {
                sourceType: entityTypeOf(source),
                sourceId: source.id,
                targetType: entityTypeOf(target),
                targetId: target.id,
                relation,
            },
            {
                onSuccess: () => {
                    toast.success("Verbindung angelegt");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    const nodeOptions = nodes.map((node) => (
        <SelectItem key={node.id} value={node.id}>
            {node.name}
        </SelectItem>
    ));

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            title="Verbindung hinzufügen"
            description="Zwei Knoten auf der Karte manuell verbinden."
            onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}
            submitLabel="Verbinden"
            isSubmitting={createEdge.isPending}
            submitDisabled={!sourceId || !targetId || sourceId === targetId}
        >
            <div className="space-y-2">
                <Label htmlFor="edge-source">Von</Label>
                <Select value={sourceId} onValueChange={setSourceId}>
                    <SelectTrigger id="edge-source">
                        <SelectValue placeholder="Knoten wählen" />
                    </SelectTrigger>
                    <SelectContent>{nodeOptions}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="edge-relation">Beziehung</Label>
                <Select value={relation} onValueChange={(value) => setRelation(value as EdgeRelation)}>
                    <SelectTrigger id="edge-relation">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {RELATIONS.map((rel) => (
                            <SelectItem key={rel} value={rel}>
                                {EDGE_RELATION_LABEL[rel]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="edge-target">Nach</Label>
                <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger id="edge-target">
                        <SelectValue placeholder="Knoten wählen" />
                    </SelectTrigger>
                    <SelectContent>{nodeOptions}</SelectContent>
                </Select>
                {sourceId !== "" && sourceId === targetId && (
                    <p className="text-sm text-destructive">Start und Ziel müssen verschieden sein.</p>
                )}
            </div>
        </FormDialog>
    );
}

export default CreateEdgeDialog;
