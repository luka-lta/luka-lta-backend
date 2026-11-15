import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { useApplyTopologyProposal, useRejectTopologyProposal } from "@/api/homelab/topologyHooks.ts";
import { EDGE_RELATION_LABEL, getNodeTypeConfig } from "@/feature/homelab/topology/constants.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import type { TopologyGraph, TopologyProposal, TopologyProposalItem } from "@/feature/homelab/topology/types.ts";

interface ProposalReviewSheetProps {
    proposal: TopologyProposal | null;
    graph: TopologyGraph;
    onOpenChange: (open: boolean) => void;
}

const NEW_NODE_PREFIX = "new:";

const OPERATION_LABEL: Record<TopologyProposalItem["operation"], string> = {
    add_node: "Add node",
    update_node: "Update node",
    remove_node: "Remove node",
    add_edge: "Add connection",
    remove_edge: "Remove connection",
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
            return added?.operation === "add_node" ? `${added.payload.name} (new)` : key;
        }
        return graph.nodes.find((node) => node.id === id)?.name ?? "unknown node";
    };

    switch (item.operation) {
        case "add_node": {
            const ref = item.payload.ref;
            const link = ref === null ? "" : ref.type === "host" ? ` · host ${ref.hostId}` : ` · ${ref.serviceKey} on ${ref.hostId}`;
            return `${item.payload.name} (${getNodeTypeConfig(item.payload.type).label})${link}`;
        }
        case "update_node": {
            const changes = [
                item.payload.name !== undefined ? `name → ${item.payload.name}` : null,
                item.payload.type !== undefined ? `type → ${getNodeTypeConfig(item.payload.type).label}` : null,
                item.payload.status !== undefined ? `status → ${item.payload.status}` : null,
                item.payload.metadata !== undefined ? "metadata" : null,
            ].filter((change) => change !== null);
            return `${nodeName(item.payload.nodeId)}: ${changes.join(", ")}`;
        }
        case "remove_node":
            return `${nodeName(item.payload.nodeId)} (and its connections)`;
        case "add_edge":
            return `${nodeName(item.payload.source)} ${EDGE_RELATION_LABEL[item.payload.relation]} ${nodeName(item.payload.target)}`;
        case "remove_edge": {
            const edge = graph.edges.find((candidate) => candidate.id === item.payload.edgeId);
            return edge
                ? `${nodeName(edge.sourceId)} ${EDGE_RELATION_LABEL[edge.relation]} ${nodeName(edge.targetId)}`
                : "connection no longer exists";
        }
    }
}

function ProposalReviewSheet({ proposal, graph, onOpenChange }: ProposalReviewSheetProps) {
    // Initialised once per opened draft (the parent remounts via `key`), so polling doesn't reset the selection.
    const [accepted, setAccepted] = useState<Set<string>>(() => new Set(proposal?.items.map((item) => item.id) ?? []));
    const applyProposal = useApplyTopologyProposal();
    const rejectProposal = useRejectTopologyProposal();

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
                        toast.warning(`Applied with ${failedCount} change(s) that no longer fit the current map.`);
                    } else {
                        toast.success("Proposal applied.");
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
                toast.success("Proposal rejected.");
                onOpenChange(false);
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
        });
    }

    const isBusy = applyProposal.isPending || rejectProposal.isPending;

    return (
        <Sheet open={proposal !== null} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
                {proposal && (
                    <>
                        <SheetHeader className="px-0">
                            <SheetTitle>{proposal.title}</SheetTitle>
                            <SheetDescription className="flex flex-wrap items-center gap-x-1.5">
                                <span>{proposal.items.length} proposed changes · {proposal.createdBy} ·</span>
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
                                Apply {accepted.size} of {proposal.items.length}
                            </Button>
                            <Button variant="outline" onClick={handleReject} disabled={isBusy}>
                                Reject draft
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default ProposalReviewSheet;
