import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { GitPullRequestArrow, Plus, Waypoints } from "lucide-react";
import { useTopologyGraph, useTopologyProposals } from "@/api/homelab/topologyHooks.ts";
import { useContainer, useHosts } from "@/api/homelab/hooks.ts";
import { getApiErrorMessage } from "@/lib/apiError.ts";
import TopologyMap from "./components/TopologyMap.tsx";
import TopologyFilters, { type HostOption } from "./components/TopologyFilters.tsx";
import TopologySearch from "./components/TopologySearch.tsx";
import NodeDetailSheet from "./components/NodeDetailSheet.tsx";
import CreateNodeDialog from "./components/CreateNodeDialog.tsx";
import CreateEdgeDialog from "./components/CreateEdgeDialog.tsx";
import ProposalReviewSheet from "./components/ProposalReviewSheet.tsx";
import { ContainerDetailSheet } from "@/feature/homelab/components/ContainerDetailSheet.tsx";
import { NODE_CATEGORIES, type NodeCategory } from "./constants.ts";
import type { TopologyGraph } from "./types.ts";

const EMPTY_GRAPH: TopologyGraph = { nodes: [], edges: [] };

function InfrastructureMap() {
    const topology = useTopologyGraph();
    const proposals = useTopologyProposals();
    const hosts = useHosts();

    const [activeCategories, setActiveCategories] = useState<Set<NodeCategory>>(new Set(NODE_CATEGORIES));
    const [problemsOnly, setProblemsOnly] = useState(false);
    const [selectedHostIds, setSelectedHostIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [createNodeOpen, setCreateNodeOpen] = useState(false);
    const [createEdgeOpen, setCreateEdgeOpen] = useState(false);

    const graph = topology.data ?? EMPTY_GRAPH;
    const openDraft = proposals.data?.find((proposal) => proposal.status === "draft") ?? null;

    // Resolve by id so the open sheet follows live status updates from polling.
    const selectedNode = useMemo(
        () => graph.nodes.find((node) => node.id === selectedNodeId) ?? null,
        [graph.nodes, selectedNodeId],
    );

    const hostOptions = useMemo<HostOption[]>(() => {
        const options = new Map<string, string>();
        for (const host of hosts.data ?? []) options.set(host.id, host.name);
        for (const node of graph.nodes) {
            if (node.ref && !options.has(node.ref.hostId)) options.set(node.ref.hostId, node.ref.hostName ?? node.ref.hostId);
        }
        return [...options.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [hosts.data, graph.nodes]);

    const containerDetailQuery = useContainer(selectedContainerId);
    const selectedHostForNode = useMemo(
        () => (selectedNode?.ref?.type === "host" ? hosts.data?.find((h) => h.id === selectedNode.ref?.hostId) : undefined),
        [hosts.data, selectedNode],
    );
    const selectedHostForContainer = useMemo(
        () => hosts.data?.find((h) => h.id === containerDetailQuery.data?.hostId),
        [hosts.data, containerDetailQuery.data],
    );

    function toggleCategory(category: NodeCategory) {
        setActiveCategories((current) => {
            const next = new Set(current);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }

    if (topology.isError) {
        return (
            <ErrorState
                title="Failed to load infrastructure map"
                message={getApiErrorMessage(topology.error)}
                refetch={topology.refetch}
            />
        );
    }

    return (
        <div className="space-y-4">
            {openDraft && (
                <Alert>
                    <GitPullRequestArrow className="h-4 w-4" />
                    <AlertTitle>Draft waiting for review: {openDraft.title}</AlertTitle>
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                            {openDraft.items.length} proposed changes by {openDraft.createdBy}. Nothing changes on the
                            map until you apply them.
                        </span>
                        <Button size="sm" onClick={() => setReviewOpen(true)}>
                            Review
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <TopologyFilters
                    activeCategories={activeCategories}
                    onToggleCategory={toggleCategory}
                    problemsOnly={problemsOnly}
                    onToggleProblemsOnly={setProblemsOnly}
                    hosts={hostOptions}
                    selectedHostIds={selectedHostIds}
                    onSelectedHostIdsChange={setSelectedHostIds}
                />
                <div className="flex items-center gap-2">
                    <TopologySearch value={searchQuery} onChange={setSearchQuery} />
                    <Button variant="outline" size="sm" onClick={() => setCreateEdgeOpen(true)}>
                        <Waypoints className="h-3.5 w-3.5" />
                        Connect
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCreateNodeOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Add node
                    </Button>
                </div>
            </div>

            {topology.isPending ? (
                <div className="flex h-[600px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
                    Loading infrastructure map…
                </div>
            ) : graph.nodes.length === 0 ? (
                <div className="flex h-[600px] flex-col items-center justify-center gap-2 rounded-lg border px-6 text-center text-sm text-muted-foreground">
                    <Waypoints className="h-8 w-8" />
                    <p>The map is curated and still empty.</p>
                    <p>Add nodes by hand, or let Claude inspect the homelab via MCP and review its draft here.</p>
                </div>
            ) : (
                <TopologyMap
                    graph={graph}
                    activeCategories={activeCategories}
                    problemsOnly={problemsOnly}
                    selectedHostIds={selectedHostIds}
                    searchQuery={searchQuery}
                    onNodeClick={(node) => setSelectedNodeId(node.id)}
                />
            )}

            <NodeDetailSheet
                node={selectedNode}
                host={selectedHostForNode}
                graph={graph}
                onOpenChange={(open) => {
                    if (!open) setSelectedNodeId(null);
                }}
                onOpenContainer={(containerId) => {
                    setSelectedNodeId(null);
                    setSelectedContainerId(containerId);
                }}
            />

            <ContainerDetailSheet
                open={selectedContainerId !== null}
                container={containerDetailQuery.data ?? null}
                host={selectedHostForContainer}
                isLoading={containerDetailQuery.isLoading}
                onOpenChange={(open) => {
                    if (!open) setSelectedContainerId(null);
                }}
            />

            <ProposalReviewSheet
                key={reviewOpen ? openDraft?.id : "closed"}
                proposal={reviewOpen ? openDraft : null}
                graph={graph}
                onOpenChange={setReviewOpen}
            />

            <CreateNodeDialog open={createNodeOpen} onOpenChange={setCreateNodeOpen} nodes={graph.nodes} />
            <CreateEdgeDialog open={createEdgeOpen} onOpenChange={setCreateEdgeOpen} nodes={graph.nodes} />
        </div>
    );
}

export default InfrastructureMap;
