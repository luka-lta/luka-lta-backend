import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { PageToolbar } from "@/components/layout/page.tsx";
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
                title="Topologie konnte nicht geladen werden"
                error={topology.error}
                onRetry={() => topology.refetch()}
            />
        );
    }

    const graph = topology.data ?? { nodes: [], edges: [] };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <PageToolbar
                actions={
                    <>
                        <Button variant="outline" onClick={() => setCreateEdgeOpen(true)} disabled={graph.nodes.length < 2}>
                            <Waypoints />
                            Verbinden
                        </Button>
                        <Button variant="outline" onClick={() => setCreateNodeOpen(true)}>
                            <Plus />
                            Knoten
                        </Button>
                    </>
                }
            >
                <TopologySearch value={searchQuery} onChange={setSearchQuery} />
                <TopologyFilters
                    activeCategories={activeCategories}
                    onToggleCategory={toggleCategory}
                    problemsOnly={problemsOnly}
                    onToggleProblemsOnly={setProblemsOnly}
                />
            </PageToolbar>

            {topology.isPending ? (
                <Skeleton className="h-[calc(100svh-19rem)] min-h-[28rem] w-full rounded-xl" aria-label="Wird geladen" />
            ) : graph.nodes.length === 0 ? (
                <EmptyState
                    icon={Waypoints}
                    title="Noch keine Infrastruktur erkannt"
                    description="Sobald Hosts und Container gemeldet werden, erscheinen sie hier. Externe Knoten kannst du manuell anlegen."
                    action={<Button variant="outline" size="sm" onClick={() => setCreateNodeOpen(true)}>Knoten hinzufügen</Button>}
                />
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
