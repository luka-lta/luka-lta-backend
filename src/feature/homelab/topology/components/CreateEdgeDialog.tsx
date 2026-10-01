import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
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
                    toast.success("Connection created.");
                    onOpenChange(false);
                },
                onError: (error) => toast.error(error.message),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add connection</DialogTitle>
                    <DialogDescription>Manually connect two nodes on the map.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>From</Label>
                        <Select value={sourceId} onValueChange={setSourceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select node" />
                            </SelectTrigger>
                            <SelectContent>
                                {nodes.map((node) => (
                                    <SelectItem key={node.id} value={node.id}>
                                        {node.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Relation</Label>
                        <Select value={relation} onValueChange={(value) => setRelation(value as EdgeRelation)}>
                            <SelectTrigger>
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
                    <div className="grid gap-2">
                        <Label>To</Label>
                        <Select value={targetId} onValueChange={setTargetId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select node" />
                            </SelectTrigger>
                            <SelectContent>
                                {nodes.map((node) => (
                                    <SelectItem key={node.id} value={node.id}>
                                        {node.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={createEdge.isPending || !sourceId || !targetId || sourceId === targetId}
                    >
                        Add connection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateEdgeDialog;
