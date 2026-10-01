export type NodeStatus = "healthy" | "warning" | "offline" | "unknown";

export type EdgeRelation = "routes_to" | "depends_on" | "connects_to" | "hosted_on" | "exposes";

export type EntityType = "host" | "container" | "node";

/**
 * A node's `type` is a free-form string (e.g. "server", "raspberry-pi", "database",
 * "reverse-proxy", "internet"). New types need no code changes — see
 * `NODE_TYPE_CONFIG` in constants.ts for how a type maps to an icon/category, and its
 * `fallback` entry for anything not explicitly listed.
 */
export interface InfraNodeData {
    id: string;
    type: string;
    name: string;
    status: NodeStatus;
    metadata: Record<string, unknown>;
    manual: boolean;
    source?: "host" | "container";
    updatedAt?: string;
}

export interface InfraEdgeData {
    id: string;
    sourceType: EntityType;
    sourceId: string;
    targetType: EntityType;
    targetId: string;
    relation: EdgeRelation;
    metadata: Record<string, unknown>;
    manual: boolean;
}

export interface TopologyGraph {
    nodes: InfraNodeData[];
    edges: InfraEdgeData[];
}
