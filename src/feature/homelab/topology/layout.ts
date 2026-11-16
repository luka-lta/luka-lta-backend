import type { Node } from "@xyflow/react";
import type { EdgeLabel, GraphLabel, NodeLabel } from "@dagrejs/dagre";
import type { InfraEdgeData, InfraNodeData } from "./types.ts";

/** Rendered size of an InfraNode — dagre needs it to avoid overlaps. */
export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 44;

/**
 * Vertical gap between nodes of the same rank. Dagre also derives the inner margin of a host frame
 * from it (~26px at 32), which leaves room for the frame's compact host label.
 */
const NODE_SEPARATION = 32;

/** Horizontal gap between ranks (left → right flow). */
const RANK_SEPARATION = 110;

/** Prefix of synthetic frames for hosts that have services on the map but no host node of their own. */
const HOST_GROUP_PREFIX = "host-group:";

/** Relations that describe the flow and therefore shape the layout. Peer links only get drawn. */
const LAYOUT_RELATIONS = new Set<InfraEdgeData["relation"]>(["exposes", "routes_to", "depends_on"]);

/** Traffic paths weigh more than dependencies, so the request flow stays as straight as possible. */
const RELATION_WEIGHT: Partial<Record<InfraEdgeData["relation"], number>> = { exposes: 3, routes_to: 3, depends_on: 1 };

export type InfraNodeFlowData = InfraNodeData & { dimmed?: boolean };

export interface HostGroupFlowData extends Record<string, unknown> {
    hostId: string;
    label: string;
    status: InfraNodeData["status"];
    /** The curated host node this frame stands for, if one exists. */
    node: InfraNodeData | null;
    dimmed?: boolean;
}

export type InfraFlowNode = Node<InfraNodeFlowData, "infra">;
export type HostGroupFlowNode = Node<HostGroupFlowData, "hostGroup">;
export type TopologyFlowNode = InfraFlowNode | HostGroupFlowNode;

export interface LayoutBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TopologyLayout {
    nodes: TopologyFlowNode[];
    /** Exact extent of the laid-out map — used for fitting instead of React Flow's measurements. */
    bounds: LayoutBounds;
    /** "hosted_on" edges made redundant by drawing the service inside its host frame. */
    hiddenEdgeIds: Set<string>;
}

interface HostGroup {
    id: string;
    hostId: string;
    hostNode: InfraNodeData | null;
    children: InfraNodeData[];
}

/** Services are framed by their host; a host node with services becomes that frame. */
function collectHostGroups(nodes: InfraNodeData[]): Map<string, HostGroup> {
    const hostNodes = new Map<string, InfraNodeData>();
    for (const node of nodes) {
        if (node.ref?.type === "host") hostNodes.set(node.ref.hostId, node);
    }

    const groups = new Map<string, HostGroup>();
    for (const node of nodes) {
        if (node.ref?.type !== "service") continue;
        const hostId = node.ref.hostId;
        const hostNode = hostNodes.get(hostId) ?? null;
        const group = groups.get(hostId) ?? {
            id: hostNode?.id ?? `${HOST_GROUP_PREFIX}${hostId}`,
            hostId,
            hostNode,
            children: [],
        };
        group.children.push(node);
        groups.set(hostId, group);
    }

    return groups;
}

function groupLabel(group: HostGroup): string {
    const sample = group.children[0]?.ref;
    return group.hostNode?.name ?? sample?.hostName ?? group.hostId;
}

/** A frame without host node shows the worst status of its services. */
function groupStatus(group: HostGroup): InfraNodeData["status"] {
    if (group.hostNode) return group.hostNode.status;
    const statuses = new Set(group.children.map((child) => child.status));
    if (statuses.has("offline")) return "offline";
    if (statuses.has("warning")) return "warning";
    if (statuses.has("healthy")) return "healthy";
    return "unknown";
}

/**
 * Layered left-to-right layout via dagre (loaded on demand, only the topology page needs it).
 * Hosts become frames around their services; flow relations rank the nodes, peer links
 * ("connects_to") are drawn but never pull nodes around. Cycles are broken by dagre.
 */
export async function layoutTopology(nodes: InfraNodeData[], edges: InfraEdgeData[]): Promise<TopologyLayout> {
    const { Graph, layout } = await import("@dagrejs/dagre");

    const groups = collectHostGroups(nodes);
    const groupIds = new Set([...groups.values()].map((group) => group.id));
    const parentOf = new Map<string, string>();
    for (const group of groups.values()) {
        for (const child of group.children) parentOf.set(child.id, group.id);
    }

    const hiddenEdgeIds = new Set(
        edges
            .filter((edge) => edge.relation === "hosted_on" && parentOf.get(edge.sourceId) === edge.targetId)
            .map((edge) => edge.id),
    );

    const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>({ compound: true, multigraph: true });
    graph.setGraph({ rankdir: "LR", nodesep: NODE_SEPARATION, ranksep: RANK_SEPARATION, marginx: 16, marginy: 16 });
    graph.setDefaultEdgeLabel(() => ({}));

    for (const groupId of groupIds) graph.setNode(groupId, { width: 0, height: 0 });
    for (const node of nodes) {
        if (groupIds.has(node.id)) continue;
        graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        const parent = parentOf.get(node.id);
        if (parent) graph.setParent(node.id, parent);
    }

    for (const edge of edges) {
        if (!LAYOUT_RELATIONS.has(edge.relation) || hiddenEdgeIds.has(edge.id)) continue;
        // Dagre cannot route edges to a frame (cluster) — those are drawn only.
        if (groupIds.has(edge.sourceId) || groupIds.has(edge.targetId)) continue;
        if (!graph.hasNode(edge.sourceId) || !graph.hasNode(edge.targetId)) continue;
        graph.setEdge(edge.sourceId, edge.targetId, { weight: RELATION_WEIGHT[edge.relation] ?? 1 }, edge.id);
    }

    layout(graph);

    const flowNodes: TopologyFlowNode[] = [];
    const groupOrigin = new Map<string, { x: number; y: number }>();
    const extent = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const include = (x: number, y: number, width: number, height: number) => {
        extent.minX = Math.min(extent.minX, x);
        extent.minY = Math.min(extent.minY, y);
        extent.maxX = Math.max(extent.maxX, x + width);
        extent.maxY = Math.max(extent.maxY, y + height);
    };

    // Parents must precede their children in React Flow's node array.
    for (const group of groups.values()) {
        const box = graph.node(group.id);
        // Dagre's cluster box already has an inner margin and keeps clusters apart — use it as is,
        // growing it would make neighbouring frames overlap.
        const x = (box.x ?? 0) - box.width / 2;
        const y = (box.y ?? 0) - box.height / 2;
        const width = box.width;
        const height = box.height;
        groupOrigin.set(group.id, { x, y });
        include(x, y, width, height);
        flowNodes.push({
            id: group.id,
            type: "hostGroup",
            position: { x, y },
            style: { width, height },
            data: { hostId: group.hostId, label: groupLabel(group), status: groupStatus(group), node: group.hostNode },
            zIndex: -1,
        });
    }

    for (const node of nodes) {
        if (groupIds.has(node.id)) continue;
        const placed = graph.node(node.id);
        const absolute = { x: (placed.x ?? 0) - NODE_WIDTH / 2, y: (placed.y ?? 0) - NODE_HEIGHT / 2 };
        const parent = parentOf.get(node.id);
        const origin = parent ? groupOrigin.get(parent) : undefined;
        include(absolute.x, absolute.y, NODE_WIDTH, NODE_HEIGHT);

        flowNodes.push({
            id: node.id,
            type: "infra",
            position: origin ? { x: absolute.x - origin.x, y: absolute.y - origin.y } : absolute,
            ...(parent ? { parentId: parent, extent: "parent" as const } : {}),
            data: node,
        });
    }

    const bounds = flowNodes.length === 0
        ? { x: 0, y: 0, width: 0, height: 0 }
        : { x: extent.minX, y: extent.minY, width: extent.maxX - extent.minX, height: extent.maxY - extent.minY };

    return { nodes: flowNodes, hiddenEdgeIds, bounds };
}
