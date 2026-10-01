import { z } from "zod";

const EntityTypeSchema = z.enum(["host", "container", "node"]);
const NodeStatusSchema = z.enum(["healthy", "warning", "offline", "unknown"]);
const RelationSchema = z.enum(["routes_to", "depends_on", "connects_to", "hosted_on", "exposes"]);

export const InfraNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    status: NodeStatusSchema,
    metadata: z.record(z.string(), z.unknown()),
    manual: z.boolean(),
    source: z.enum(["host", "container"]).optional(),
    updatedAt: z.string().optional(),
});

export const InfraEdgeSchema = z.object({
    id: z.string(),
    sourceType: EntityTypeSchema,
    sourceId: z.string(),
    targetType: EntityTypeSchema,
    targetId: z.string(),
    relation: RelationSchema,
    metadata: z.record(z.string(), z.unknown()),
    manual: z.boolean(),
});

export const topologyGraphSchema = z.object({
    nodes: z.array(InfraNodeSchema),
    edges: z.array(InfraEdgeSchema),
});

export const topologyNodeCreatedSchema = z.object({ node: InfraNodeSchema });
export const topologyEdgeCreatedSchema = z.object({ edge: InfraEdgeSchema });
