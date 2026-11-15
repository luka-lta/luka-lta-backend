import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog.tsx";
import { useApplyTopologyProposal, useRejectTopologyProposal } from "@/api/homelab/topologyHooks.ts";
import { EDGE_RELATION_LABEL, getNodeTypeConfig, STATUS_CONFIG } from "@/feature/homelab/topology/constants.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import type { TopologyGraph, TopologyProposal, TopologyProposalItem } from "@/feature/homelab/topology/types.ts";

interface ProposalReviewSheetProps {
    proposal: TopologyProposal | null;
    graph: TopologyGraph;
    onOpenChange: (open: boolean) => void;
}

const NEW_NODE_PREFIX = "new:";

const OPERATION_LABEL: Record<TopologyProposalItem["operation"], string> = {
    add_node: "Knoten neu",
    update_node: "Knoten ändern",
    remove_node: "Knoten entfernen",
    add_edge: "Verbindung neu",
    remove_edge: "Verbindung entfernen",
};

/** Keys of nodes added by this proposal that an item depends on (edges pointing at "new:<key>"). */
function newNodeDependencies(item: TopologyProposalItem): string[] {
    if (item.operation !== "add_edge") return [];
    return [item.payload.source, item.payload.target]
        .filter((endpoint) => endpoint.startsWith(NEW_NODE_PREFIX))
        .map((endpoint) => endpoint.slice(NEW_NODE_PREFIX.length));
}

function describeItem(item: TopologyProposalItem, graph: TopologyGraph, proposal: TopologyProposal): string {
    const nodeName = (id: string): string => {
        if (id.startsWith(NEW_NODE_PREFIX)) {
            const key = id.slice(NEW_NODE_PREFIX.length);
            const added = proposal.items.find((other) => other.operation === "add_node" && other.payload.key === key);
            return added?.operation === "add_node" ? `${added.payload.name} (neu)` : key;
        }
        return graph.nodes.find((node) => node.id === id)?.name ?? "unbekannter Knoten";
    };

    switch (item.operation) {
        case "add_node": {
            const ref = item.payload.ref;
            const link = ref === null ? "" : ref.type === "host" ? ` · Host ${ref.hostId}` : ` · ${ref.serviceKey} auf ${ref.hostId}`;
            return `${item.payload.name} (${getNodeTypeConfig(item.payload.type).label})${link}`;
        }
        case "update_node": {
            const changes = [
                item.payload.name !== undefined ? `Name → ${item.payload.name}` : null,
                item.payload.type !== undefined ? `Typ → ${getNodeTypeConfig(item.payload.type).label}` : null,
                item.payload.status !== undefined ? `Status → ${STATUS_CONFIG[item.payload.status].label}` : null,
                item.payload.metadata !== undefined ? "Metadaten" : null,
            ].filter((change) => change !== null);
            return `${nodeName(item.payload.nodeId)}: ${changes.join(", ")}`;
        }
        case "remove_node":
            return `${nodeName(item.payload.nodeId)} (samt Verbindungen)`;
        case "add_edge":
            return `${nodeName(item.payload.source)} ${EDGE_RELATION_LABEL[item.payload.relation]} ${nodeName(item.payload.target)}`;
        case "remove_edge": {
            const edge = graph.edges.find((candidate) => candidate.id === item.payload.edgeId);
            return edge
                ? `${nodeName(edge.sourceId)} ${EDGE_RELATION_LABEL[edge.relation]} ${nodeName(edge.targetId)}`
                : "Verbindung existiert nicht mehr";
        }
    }
}

function ProposalReviewSheet({ proposal, graph, onOpenChange }: ProposalReviewSheetProps) {
    // Initialised once per opened draft (the parent remounts via `key`), so polling doesn't reset the selection.
    const [accepted, setAccepted] = useState<Set<string>>(() => new Set(proposal?.items.map((item) => item.id) ?? []));
    const applyProposal = useApplyTopologyProposal();
    const rejectProposal = useRejectTopologyProposal();
    const [rejectOpen, setRejectOpen] = useState(false);

    const addNodeIdByKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const item of proposal?.items ?? []) {
            if (item.operation === "add_node") map.set(item.payload.key, item.id);
        }
        return map;
    }, [proposal]);

    // Keeps dependent items consistent: an edge to a new node needs that node, and dropping
    // a new node drops every edge pointing at it — otherwise the edge would only fail on apply.
    function toggleItem(item: TopologyProposalItem, checked: boolean) {
        if (!proposal) return;
        const next = new Set(accepted);

        if (checked) {
            next.add(item.id);
            for (const key of newNodeDependencies(item)) {
                const nodeItemId = addNodeIdByKey.get(key);
                if (nodeItemId) next.add(nodeItemId);
            }
        } else {
            next.delete(item.id);
            if (item.operation === "add_node") {
                for (const other of proposal.items) {
                    if (newNodeDependencies(other).includes(item.payload.key)) next.delete(other.id);
                }
            }
        }

        setAccepted(next);
    }

    function handleApply() {
        if (!proposal) return;
        applyProposal.mutate(
            { proposalId: proposal.id, acceptedItemIds: [...accepted] },
            {
                onSuccess: ({ failedCount }) => {
                    if (failedCount) {
                        toast.warning(`Übernommen – ${failedCount} Änderung(en) passten nicht mehr zur aktuellen Karte`);
                    } else {
                        toast.success("Entwurf übernommen");
                    }
                    onOpenChange(false);
                },
                onError: (error) => toast.error(getApiErrorMessage(error)),
            },
        );
    }

    function handleReject() {
        if (!proposal) return;
        rejectProposal.mutate(proposal.id, {
            onSuccess: () => {
                setRejectOpen(false);
                toast.success("Entwurf abgelehnt");
                onOpenChange(false);
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    }

    const isBusy = applyProposal.isPending || rejectProposal.isPending;

    return (
        <Sheet open={proposal !== null} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-xl">
                {proposal && (
                    <>
                        <SheetHeader>
                            <SheetTitle>{proposal.title}</SheetTitle>
                            <SheetDescription className="flex flex-wrap items-center gap-x-1.5">
                                <span>{proposal.items.length} Änderungen · {proposal.createdBy} ·</span>
                                <TimeCell iso={proposal.createdAt} />
                            </SheetDescription>
                        </SheetHeader>

                        {proposal.summary && (
                            <p className="whitespace-pre-line text-sm text-muted-foreground">{proposal.summary}</p>
                        )}

                        <Separator />

                        <ul className="-mr-2 flex-1 space-y-3 overflow-y-auto pr-2">
                            {proposal.items.map((item) => (
                                <li key={item.id} className="rounded-md border p-3">
                                    <label className="flex cursor-pointer items-start gap-3">
                                        <Checkbox
                                            className="mt-0.5"
                                            checked={accepted.has(item.id)}
                                            onCheckedChange={(checked) => toggleItem(item, checked === true)}
                                        />
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant={item.operation.startsWith("remove") ? "destructive" : "secondary"}
                                                >
                                                    {OPERATION_LABEL[item.operation]}
                                                </Badge>
                                                <span className="text-sm font-medium">
                                                    {describeItem(item, graph, proposal)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.reasoning}</p>
                                            {item.evidence.length > 0 && (
                                                <ul className="space-y-0.5">
                                                    {item.evidence.map((entry, index) => (
                                                        <li key={index} className="break-all font-mono text-xs text-muted-foreground">
                                                            {entry}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-2 border-t pt-4">
                            <Button onClick={handleApply} disabled={isBusy || accepted.size === 0}>
                                {accepted.size} von {proposal.items.length} übernehmen
                            </Button>
                            <Button
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setRejectOpen(true)}
                                disabled={isBusy}
                            >
                                Entwurf ablehnen
                            </Button>
                        </div>

                        <ConfirmDialog
                            open={rejectOpen}
                            onOpenChange={setRejectOpen}
                            destructive
                            title="Entwurf ablehnen?"
                            description="Keine der vorgeschlagenen Änderungen wird übernommen. Der Entwurf bleibt im Verlauf sichtbar."
                            confirmLabel="Ablehnen"
                            isLoading={rejectProposal.isPending}
                            onConfirm={handleReject}
                        />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default ProposalReviewSheet;
