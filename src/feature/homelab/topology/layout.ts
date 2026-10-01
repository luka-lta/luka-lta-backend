import type { Edge, Node } from "@xyflow/react";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 56;
const COL_GAP = 24;
const ROW_GAP = 16;
const GROUP_GAP = 56;
const RANK_GAP = 96;

/** Wrap a host's containers into a grid instead of one endless row once it has this many. */
const MAX_COLUMNS_PER_GROUP = 6;

interface EffectiveEdge {
    parent: string;
    child: string;
}

/** Longest-path rank (0 = root) from a DAG of parent -> child edges. Unreached nodes default to 0. */
function computeRanks(nodeIds: string[], edges: EffectiveEdge[]): Map<string, number> {
    const children = new Map<string, string[]>();
    const indegree = new Map<string, number>();
    for (const id of nodeIds) {
        children.set(id, []);
        indegree.set(id, 0);
    }
    for (const edge of edges) {
        if (!children.has(edge.parent) || !children.has(edge.child)) continue;
        children.get(edge.parent)!.push(edge.child);
        indegree.set(edge.child, (indegree.get(edge.child) ?? 0) + 1);
    }

    const rank = new Map<string, number>(nodeIds.map((id) => [id, 0]));
    const remaining = new Map(indegree);
    const queue = nodeIds.filter((id) => indegree.get(id) === 0);

    for (let i = 0; i < queue.length; i++) {
        const id = queue[i];
        for (const child of children.get(id) ?? []) {
            rank.set(child, Math.max(rank.get(child) ?? 0, (rank.get(id) ?? 0) + 1));
            const next = (remaining.get(child) ?? 0) - 1;
            remaining.set(child, next);
            if (next === 0) queue.push(child);
        }
    }

    return rank;
}

/** Container -> hosting host id, derived from "hosted_on" edges (source=container, target=host). */
function buildHostOfContainer(edges: Edge[]): Map<string, string> {
    const hostOf = new Map<string, string>();
    for (const edge of edges) {
        const relation = (edge.data as { relation?: string } | undefined)?.relation;
        if (relation === "hosted_on") {
            hostOf.set(edge.source, edge.target);
        }
    }
    return hostOf;
}

/**
 * Custom layered layout: ranks nodes by hierarchy depth (hosted_on/routes_to/depends_on),
 * then packs each rank left-to-right, grouping a host's containers together and wrapping
 * any group past MAX_COLUMNS_PER_GROUP into multiple rows instead of one endless line.
 * "connects_to" (peer/same-network) never participates in ranking — it's rendered but
 * doesn't shape the hierarchy.
 */
export function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
    const nodeIds = nodes.map((n) => n.id);
    const nodeIdSet = new Set(nodeIds);

    const effectiveEdges: EffectiveEdge[] = [];
    for (const edge of edges) {
        if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
        const relation = (edge.data as { relation?: string } | undefined)?.relation;
        if (relation === "connects_to") continue;
        if (relation === "hosted_on") {
            effectiveEdges.push({ parent: edge.target, child: edge.source });
        } else {
            effectiveEdges.push({ parent: edge.source, child: edge.target });
        }
    }

    const ranks = computeRanks(nodeIds, effectiveEdges);
    const hostOfContainer = buildHostOfContainer(edges);

    const nodesByRank = new Map<number, Node[]>();
    for (const node of nodes) {
        const rank = ranks.get(node.id) ?? 0;
        if (!nodesByRank.has(rank)) nodesByRank.set(rank, []);
        nodesByRank.get(rank)!.push(node);
    }

    const positions = new Map<string, { x: number; y: number }>();
    let rankY = 0;

    for (const rank of [...nodesByRank.keys()].sort((a, b) => a - b)) {
        const rankNodes = nodesByRank.get(rank)!;

        // Group by hosting host (containers on the same host stay together); every
        // other node (hosts themselves, manual/infra nodes) is its own singleton group.
        const groups = new Map<string, Node[]>();
        for (const node of rankNodes) {
            const groupKey = hostOfContainer.get(node.id) ?? node.id;
            if (!groups.has(groupKey)) groups.set(groupKey, []);
            groups.get(groupKey)!.push(node);
        }

        const groupLayouts = [...groups.values()].map((groupNodes) => {
            const columns = Math.min(MAX_COLUMNS_PER_GROUP, groupNodes.length);
            const rows = Math.ceil(groupNodes.length / columns);
            const width = columns * NODE_WIDTH + (columns - 1) * COL_GAP;
            return { groupNodes, columns, rows, width };
        });

        const rankWidth =
            groupLayouts.reduce((sum, g) => sum + g.width, 0) + GROUP_GAP * Math.max(0, groupLayouts.length - 1);
        const rankHeight = Math.max(...groupLayouts.map((g) => g.rows), 1) * NODE_HEIGHT +
            (Math.max(...groupLayouts.map((g) => g.rows), 1) - 1) * ROW_GAP;

        let groupX = -rankWidth / 2;
        for (const group of groupLayouts) {
            group.groupNodes.forEach((node, index) => {
                const col = index % group.columns;
                const row = Math.floor(index / group.columns);
                positions.set(node.id, {
                    x: groupX + col * (NODE_WIDTH + COL_GAP),
                    y: rankY + row * (NODE_HEIGHT + ROW_GAP),
                });
            });
            groupX += group.width + GROUP_GAP;
        }

        rankY += rankHeight + RANK_GAP;
    }

    return nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? { x: 0, y: 0 } }));
}
