import { useEffect, useMemo, type CSSProperties } from "react";
import {
    Background,
    Controls,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Edge,
    type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button.tsx";
import { LocateFixed } from "lucide-react";
import InfraNode from "./InfraNode.tsx";
import { layoutGraph } from "@/feature/homelab/topology/layout.ts";
import { getNodeTypeConfig } from "@/feature/homelab/topology/constants.ts";
import type { InfraNodeData, TopologyGraph } from "@/feature/homelab/topology/types.ts";
import type { NodeCategory } from "@/feature/homelab/topology/constants.ts";

const NODE_TYPES = { infra: InfraNode };

interface TopologyMapProps {
    graph: TopologyGraph;
    activeCategories: Set<NodeCategory>;
    problemsOnly: boolean;
    searchQuery: string;
    onNodeClick: (node: InfraNodeData) => void;
}

function matchesFilters(node: InfraNodeData, activeCategories: Set<NodeCategory>, problemsOnly: boolean): boolean {
    const category = getNodeTypeConfig(node.type).category;
    if (!activeCategories.has(category)) return false;
    if (problemsOnly && node.status === "healthy") return false;
    return true;
}

function TopologyMapInner({ graph, activeCategories, problemsOnly, searchQuery, onNodeClick }: TopologyMapProps) {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const visibleNodeData = useMemo(
        () => graph.nodes.filter((node) => matchesFilters(node, activeCategories, problemsOnly)),
        [graph.nodes, activeCategories, problemsOnly],
    );
    const visibleIds = useMemo(() => new Set(visibleNodeData.map((n) => n.id)), [visibleNodeData]);

    const query = searchQuery.trim().toLowerCase();
    const matchedIds = useMemo(() => {
        if (!query) return null;
        const direct = new Set(
            visibleNodeData.filter((n) => n.name.toLowerCase().includes(query) || n.type.toLowerCase().includes(query)).map((n) => n.id),
        );
        const neighbors = new Set(direct);
        for (const edge of graph.edges) {
            if (direct.has(edge.sourceId)) neighbors.add(edge.targetId);
            if (direct.has(edge.targetId)) neighbors.add(edge.sourceId);
        }
        return neighbors;
    }, [query, visibleNodeData, graph.edges]);

    const visibleEdgeData = useMemo(
        () => graph.edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)),
        [graph.edges, visibleIds],
    );

    // Identity of graph.nodes/edges changes on every poll even when nothing actually
    // changed, since react-query returns a new array each fetch. Re-running dagre and
    // resetting positions/viewport on every poll would fight the user's pan/zoom, so
    // only re-layout when the actual set of visible nodes/edges changes.
    const structureKey = useMemo(
        () =>
            `${visibleNodeData.map((n) => n.id).sort().join(",")}|${visibleEdgeData.map((e) => e.id).sort().join(",")}`,
        [visibleNodeData, visibleEdgeData],
    );

    useEffect(() => {
        const flowNodes: Node[] = visibleNodeData.map((node) => ({
            id: node.id,
            type: "infra",
            position: { x: 0, y: 0 },
            data: { ...node, dimmed: matchedIds !== null && !matchedIds.has(node.id) },
        }));

        const flowEdges: Edge[] = visibleEdgeData.map((edge) => ({
            id: edge.id,
            source: edge.sourceId,
            target: edge.targetId,
            data: { relation: edge.relation },
            animated: false,
            style: edgeStyle(edge.relation),
            label: edge.relation === "routes_to" ? (edge.metadata.rule as string | undefined) : undefined,
            labelStyle: { fontSize: 10 },
        }));

        setNodes(layoutGraph(flowNodes, flowEdges));
        setEdges(flowEdges);
        // Only the structural signature should trigger a reposition — see comment above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureKey, setNodes, setEdges]);

    // Structure-independent updates (status changed, search highlight changed): patch
    // node data in place without touching position, so pan/zoom isn't disturbed.
    useEffect(() => {
        setNodes((current) =>
            current.map((flowNode) => {
                const updated = visibleNodeData.find((n) => n.id === flowNode.id);
                if (!updated) return flowNode;
                return { ...flowNode, data: { ...updated, dimmed: matchedIds !== null && !matchedIds.has(flowNode.id) } };
            }),
        );
    }, [visibleNodeData, matchedIds, setNodes]);

    useEffect(() => {
        if (!query || !matchedIds || matchedIds.size === 0) return;
        const target = visibleNodeData.find((n) => matchedIds.has(n.id));
        if (target) {
            window.requestAnimationFrame(() => fitView({ nodes: [{ id: target.id }], maxZoom: 1.2 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <div className="h-[600px] w-full rounded-lg border bg-background">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={NODE_TYPES}
                onNodeClick={(_, node) => onNodeClick(node.data as unknown as InfraNodeData)}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={20} size={1} className="opacity-40" />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable className="!bg-card" />
                <Panel position="top-right">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setNodes((current) => layoutGraph(current, edges));
                            window.requestAnimationFrame(() => fitView());
                        }}
                    >
                        <LocateFixed className="h-3.5 w-3.5" />
                        Reset Layout
                    </Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

function edgeStyle(relation: string): CSSProperties {
    switch (relation) {
        case "routes_to":
            return { stroke: "hsl(var(--chart-1))", strokeWidth: 1.5 };
        case "depends_on":
            return { stroke: "hsl(var(--chart-2))", strokeWidth: 1.5, strokeDasharray: "4 3" };
        case "connects_to":
            return { stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "2 3" };
        default:
            return { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 };
    }
}

function TopologyMap(props: TopologyMapProps) {
    return (
        <ReactFlowProvider>
            <TopologyMapInner {...props} />
        </ReactFlowProvider>
    );
}

export default TopologyMap;
