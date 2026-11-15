import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
    Background,
    Controls,
    MarkerType,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    useNodesInitialized,
    useNodesState,
    useReactFlow,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button.tsx";
import { useTheme } from "@/context/theme-context.tsx";
import { LocateFixed } from "lucide-react";
import InfraNode from "./InfraNode.tsx";
import HostGroupNode from "./HostGroupNode.tsx";
import { layoutTopology, type TopologyFlowNode } from "@/feature/homelab/topology/layout.ts";
import { EDGE_RELATION_LABEL, getNodeTypeConfig } from "@/feature/homelab/topology/constants.ts";
import type {
    EdgeRelation,
    InfraEdgeData,
    InfraNodeData,
    TopologyGraph,
} from "@/feature/homelab/topology/types.ts";
import type { NodeCategory } from "@/feature/homelab/topology/constants.ts";

const NODE_TYPES = { infra: InfraNode, hostGroup: HostGroupNode };

/** Opacity of edges that are not connected to the focused node. */
const UNFOCUSED_EDGE_OPACITY = 0.12;

/** Opacity of edges when nothing is focused. */
const DEFAULT_EDGE_OPACITY = 0.7;

const RELATION_STYLE: Record<EdgeRelation, CSSProperties> = {
    exposes: { stroke: "hsl(var(--chart-4))", strokeWidth: 1.5 },
    routes_to: { stroke: "hsl(var(--chart-1))", strokeWidth: 1.5 },
    depends_on: { stroke: "hsl(var(--chart-2))", strokeWidth: 1.5, strokeDasharray: "5 4" },
    connects_to: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "2 4" },
    hosted_on: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 },
};

const LEGEND_RELATIONS: EdgeRelation[] = ["exposes", "routes_to", "depends_on", "connects_to"];

interface TopologyMapProps {
    graph: TopologyGraph;
    activeCategories: Set<NodeCategory>;
    problemsOnly: boolean;
    selectedHostIds: Set<string>;
    showPeerLinks: boolean;
    searchQuery: string;
    onNodeClick: (node: InfraNodeData) => void;
}

function matchesFilters(node: InfraNodeData, activeCategories: Set<NodeCategory>, problemsOnly: boolean): boolean {
    const category = getNodeTypeConfig(node.type).category;
    if (!activeCategories.has(category)) return false;
    if (problemsOnly && node.status === "healthy") return false;
    return true;
}

/**
 * Host filter: linked nodes are shown when their host is selected. Unlinked nodes (Internet,
 * domains, Cloudflare …) stay visible as long as a chain of unlinked nodes connects them to a
 * shown linked node — so the path "Internet → domain → proxy" survives filtering by host.
 */
function nodesOnHosts(nodes: InfraNodeData[], edges: InfraEdgeData[], hostIds: Set<string>): Set<string> | null {
    if (hostIds.size === 0) return null;

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const neighbors = new Map<string, string[]>();
    for (const edge of edges) {
        neighbors.set(edge.sourceId, [...(neighbors.get(edge.sourceId) ?? []), edge.targetId]);
        neighbors.set(edge.targetId, [...(neighbors.get(edge.targetId) ?? []), edge.sourceId]);
    }

    const shown = new Set(nodes.filter((node) => node.ref && hostIds.has(node.ref.hostId)).map((node) => node.id));
    const queue = [...shown];
    for (let i = 0; i < queue.length; i++) {
        for (const neighborId of neighbors.get(queue[i]) ?? []) {
            const neighbor = byId.get(neighborId);
            if (!neighbor || neighbor.ref || shown.has(neighborId)) continue;
            shown.add(neighborId);
            queue.push(neighborId);
        }
    }

    return shown;
}

function routeLabel(edge: InfraEdgeData): string | undefined {
    return edge.relation === "routes_to" && typeof edge.metadata.rule === "string" ? edge.metadata.rule : undefined;
}

function TopologyMapInner({
    graph,
    activeCategories,
    problemsOnly,
    selectedHostIds,
    showPeerLinks,
    searchQuery,
    onNodeClick,
}: TopologyMapProps) {
    const { fitView } = useReactFlow();
    const { theme } = useTheme();
    const nodesInitialized = useNodesInitialized();
    const [fitPending, setFitPending] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState<TopologyFlowNode>([]);
    const [hiddenEdgeIds, setHiddenEdgeIds] = useState<Set<string>>(new Set());
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [layoutRun, setLayoutRun] = useState(0);

    const hostNodeIds = useMemo(
        () => nodesOnHosts(graph.nodes, graph.edges, selectedHostIds),
        [graph.nodes, graph.edges, selectedHostIds],
    );

    const visibleNodeData = useMemo(
        () =>
            graph.nodes.filter(
                (node) =>
                    (hostNodeIds === null || hostNodeIds.has(node.id)) &&
                    matchesFilters(node, activeCategories, problemsOnly),
            ),
        [graph.nodes, hostNodeIds, activeCategories, problemsOnly],
    );
    const visibleIds = useMemo(() => new Set(visibleNodeData.map((n) => n.id)), [visibleNodeData]);

    const visibleEdgeData = useMemo(
        () => graph.edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)),
        [graph.edges, visibleIds],
    );

    const query = searchQuery.trim().toLowerCase();
    const matchedIds = useMemo(() => {
        if (!query) return null;
        const direct = new Set(
            visibleNodeData
                .filter((n) => n.name.toLowerCase().includes(query) || n.type.toLowerCase().includes(query))
                .map((n) => n.id),
        );
        const neighbors = new Set(direct);
        for (const edge of graph.edges) {
            if (direct.has(edge.sourceId)) neighbors.add(edge.targetId);
            if (direct.has(edge.targetId)) neighbors.add(edge.sourceId);
        }
        return neighbors;
    }, [query, visibleNodeData, graph.edges]);

    // Identity of graph.nodes/edges changes on every poll even when nothing actually
    // changed, since react-query returns a new array each fetch. Re-running the layout and
    // resetting positions/viewport on every poll would fight the user's pan/zoom, so
    // only re-layout when the actual set of visible nodes/edges changes.
    const structureKey = useMemo(
        () =>
            `${visibleNodeData.map((n) => n.id).sort().join(",")}|${visibleEdgeData
                .map((e) => `${e.id}:${e.relation}`)
                .sort()
                .join(",")}`,
        [visibleNodeData, visibleEdgeData],
    );

    useEffect(() => {
        let cancelled = false;

        layoutTopology(visibleNodeData, visibleEdgeData).then((result) => {
            if (cancelled) return;
            setNodes(result.nodes);
            setHiddenEdgeIds(result.hiddenEdgeIds);
            setFitPending(true);
        });

        return () => {
            cancelled = true;
        };
        // Only the structural signature (or an explicit reset) should trigger a reposition — see comment above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureKey, layoutRun]);

    // fitView only considers measured nodes — wait until React Flow has measured the new layout.
    useEffect(() => {
        if (!fitPending || !nodesInitialized) return;
        fitView({ padding: 0.1, maxZoom: 1.2 });
        setFitPending(false);
    }, [fitPending, nodesInitialized, fitView]);

    // Structure-independent updates (status changed): patch node data in place without
    // touching position, so pan/zoom isn't disturbed.
    useEffect(() => {
        const byId = new Map(visibleNodeData.map((node) => [node.id, node]));
        setNodes((current) =>
            current.map((flowNode) => {
                if (flowNode.type === "hostGroup") {
                    const hostNode = byId.get(flowNode.id) ?? flowNode.data.node;
                    return {
                        ...flowNode,
                        data: { ...flowNode.data, node: hostNode, status: hostNode?.status ?? flowNode.data.status },
                    };
                }
                const updated = byId.get(flowNode.id);
                return updated ? { ...flowNode, data: updated } : flowNode;
            }),
        );
    }, [visibleNodeData, setNodes]);

    const shownEdgeData = useMemo(
        () =>
            visibleEdgeData.filter(
                (edge) => !hiddenEdgeIds.has(edge.id) && (showPeerLinks || edge.relation !== "connects_to"),
            ),
        [visibleEdgeData, hiddenEdgeIds, showPeerLinks],
    );

    // Focus (hover) beats search: highlight the focused node, its neighbours and their edges.
    const highlightedIds = useMemo(() => {
        if (focusedId === null) return matchedIds;
        const ids = new Set([focusedId]);
        for (const edge of shownEdgeData) {
            if (edge.sourceId === focusedId) ids.add(edge.targetId);
            if (edge.targetId === focusedId) ids.add(edge.sourceId);
        }
        return ids;
    }, [focusedId, shownEdgeData, matchedIds]);

    const displayNodes = useMemo<TopologyFlowNode[]>(() => {
        const isHighlighted = (id: string) => highlightedIds === null || highlightedIds.has(id);
        return nodes.map((node) => {
            if (node.type === "infra") return { ...node, data: { ...node.data, dimmed: !isHighlighted(node.id) } };
            // A frame stays visible while anything inside it is highlighted.
            const hasHighlightedChild = nodes.some((child) => child.parentId === node.id && isHighlighted(child.id));
            return { ...node, data: { ...node.data, dimmed: !isHighlighted(node.id) && !hasHighlightedChild } };
        });
    }, [nodes, highlightedIds]);

    const displayEdges = useMemo<Edge[]>(
        () =>
            shownEdgeData.map((edge) => {
                const isFocused = focusedId !== null && (edge.sourceId === focusedId || edge.targetId === focusedId);
                const opacity = focusedId === null ? DEFAULT_EDGE_OPACITY : isFocused ? 1 : UNFOCUSED_EDGE_OPACITY;
                const base = RELATION_STYLE[edge.relation];
                const isDirected = edge.relation !== "connects_to";
                return {
                    id: edge.id,
                    source: edge.sourceId,
                    target: edge.targetId,
                    type: "smoothstep",
                    style: { ...base, opacity, strokeWidth: Number(base.strokeWidth) + (isFocused ? 1 : 0) },
                    markerEnd: isDirected
                        ? { type: MarkerType.ArrowClosed, width: 14, height: 14, color: String(base.stroke) }
                        : undefined,
                    // Route rules would clutter the map; show them for the focused node only.
                    label: isFocused ? routeLabel(edge) : undefined,
                    labelStyle: { fontSize: 10 },
                    zIndex: isFocused ? 10 : 0,
                };
            }),
        [shownEdgeData, focusedId],
    );

    useEffect(() => {
        if (!query || !matchedIds || matchedIds.size === 0) return;
        const target = visibleNodeData.find((n) => matchedIds.has(n.id));
        if (target) {
            window.requestAnimationFrame(() => fitView({ nodes: [{ id: target.id }], maxZoom: 1.2 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <div className="h-[calc(100svh-19rem)] min-h-[28rem] w-full overflow-hidden rounded-xl border bg-card shadow-xs">
            <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                onNodesChange={onNodesChange}
                nodeTypes={NODE_TYPES}
                onNodeClick={(_, node) => {
                    if (node.type === "infra") onNodeClick(node.data);
                    if (node.type === "hostGroup" && node.data.node) onNodeClick(node.data.node);
                }}
                onNodeMouseEnter={(_, node) => setFocusedId(node.id)}
                onNodeMouseLeave={() => setFocusedId(null)}
                nodesConnectable={false}
                colorMode={theme}
                minZoom={0.15}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={20} size={1} className="opacity-40" />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable className="!bg-card" />
                <Panel position="top-left">
                    <div className="flex flex-wrap gap-3 rounded-md border bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
                        {LEGEND_RELATIONS.filter((relation) => showPeerLinks || relation !== "connects_to").map(
                            (relation) => (
                                <span key={relation} className="flex items-center gap-1.5">
                                    <svg width="22" height="6" aria-hidden="true">
                                        <line x1="0" y1="3" x2="22" y2="3" style={RELATION_STYLE[relation]} />
                                    </svg>
                                    {EDGE_RELATION_LABEL[relation]}
                                </span>
                            ),
                        )}
                    </div>
                </Panel>
                <Panel position="top-right">
                    <Button variant="outline" size="sm" onClick={() => setLayoutRun((run) => run + 1)}>
                        <LocateFixed />
                        Layout neu anordnen
                    </Button>
                </Panel>
            </ReactFlow>
        </div>
    );
}

function TopologyMap(props: TopologyMapProps) {
    return (
        <ReactFlowProvider>
            <TopologyMapInner {...props} />
        </ReactFlowProvider>
    );
}

export default TopologyMap;
