import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { Plus, Waypoints } from "lucide-react";
import { useTopologyGraph } from "@/api/homelab/topologyHooks.ts";
import { useContainer, useHosts } from "@/api/homelab/hooks.ts";
import TopologyMap from "./components/TopologyMap.tsx";
import TopologyFilters from "./components/TopologyFilters.tsx";
import TopologySearch from "./components/TopologySearch.tsx";
import NodeDetailSheet from "./components/NodeDetailSheet.tsx";
import CreateNodeDialog from "./components/CreateNodeDialog.tsx";
import CreateEdgeDialog from "./components/CreateEdgeDialog.tsx";
import { ContainerDetailSheet } from "@/feature/homelab/components/ContainerDetailSheet.tsx";
import { NODE_CATEGORIES, type NodeCategory } from "./constants.ts";
import type { InfraNodeData } from "./types.ts";

function InfrastructureMap() {
    const topology = useTopologyGraph();
    const hosts = useHosts();

    const [activeCategories, setActiveCategories] = useState<Set<NodeCategory>>(new Set(NODE_CATEGORIES));
    const [problemsOnly, setProblemsOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNode, setSelectedNode] = useState<InfraNodeData | null>(null);
    const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
    const [createNodeOpen, setCreateNodeOpen] = useState(false);
    const [createEdgeOpen, setCreateEdgeOpen] = useState(false);

    const containerDetailQuery = useContainer(selectedContainerId);
    const selectedHostForNode = useMemo(
        () => hosts.data?.find((h) => h.id === selectedNode?.id),
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

    function handleNodeClick(node: InfraNodeData) {
        if (node.source === "container") {
            setSelectedContainerId(node.id);
        } else {
            setSelectedNode(node);
        }
    }

    if (topology.isError) {
        return (
            <ErrorState
                title="Failed to load infrastructure map"
                message={topology.error.message}
                refetch={topology.refetch}
            />
        );
    }

    const graph = topology.data ?? { nodes: [], edges: [] };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <TopologyFilters
                    activeCategories={activeCategories}
                    onToggleCategory={toggleCategory}
                    problemsOnly={problemsOnly}
                    onToggleProblemsOnly={setProblemsOnly}
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
                <div className="flex h-[600px] flex-col items-center justify-center gap-2 rounded-lg border text-sm text-muted-foreground">
                    <Waypoints className="h-8 w-8" />
                    No infrastructure discovered yet.
                </div>
            ) : (
                <TopologyMap
                    graph={graph}
                    activeCategories={activeCategories}
                    problemsOnly={problemsOnly}
                    searchQuery={searchQuery}
                    onNodeClick={handleNodeClick}
                />
            )}

            <NodeDetailSheet
                node={selectedNode}
                host={selectedHostForNode}
                onOpenChange={(open) => {
                    if (!open) setSelectedNode(null);
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

            <CreateNodeDialog open={createNodeOpen} onOpenChange={setCreateNodeOpen} />
            <CreateEdgeDialog open={createEdgeOpen} onOpenChange={setCreateEdgeOpen} nodes={graph.nodes} />
        </div>
    );
}

export default InfrastructureMap;
