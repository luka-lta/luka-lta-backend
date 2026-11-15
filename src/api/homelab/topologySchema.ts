import { z } from "zod";

const NodeStatusSchema = z.enum(["healthy", "warning", "offline", "unknown"]);
const RelationSchema = z.enum(["routes_to", "depends_on", "connects_to", "hosted_on", "exposes"]);
const MetadataSchema = z.record(z.string(), z.unknown());

const NodeRefSchema = z.object({
    type: z.enum(["host", "service"]),
    hostId: z.string(),
    serviceKey: z.string().nullable(),
});

/** Referenz im Graph — zusätzlich gegen die Live-Daten des Agents aufgelöst. */
const ResolvedNodeRefSchema = NodeRefSchema.extend({
    resolved: z.boolean(),
    hostName: z.string().nullable(),
    containerId: z.string().nullable().optional(),
});

export const InfraNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    status: NodeStatusSchema,
    ref: ResolvedNodeRefSchema.nullable(),
    metadata: MetadataSchema,
    updatedAt: z.string().optional(),
});

export const InfraEdgeSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    targetId: z.string(),
    relation: RelationSchema,
    metadata: MetadataSchema,
});

export const topologyGraphSchema = z.object({
    nodes: z.array(InfraNodeSchema),
    edges: z.array(InfraEdgeSchema),
});

export const topologyNodeCreatedSchema = z.object({ node: InfraNodeSchema.omit({ ref: true }) });
export const topologyEdgeCreatedSchema = z.object({ edge: InfraEdgeSchema });

const ProposalItemBaseSchema = z.object({
    id: z.string(),
    position: z.number(),
    reasoning: z.string(),
    evidence: z.array(z.string()),
    status: z.enum(["pending", "applied", "rejected", "failed"]),
    failure: z.string().nullable(),
});

/** Payload je Operation — so, wie die API ihn beim Anlegen normalisiert hat. */
export const ProposalItemSchema = z.discriminatedUnion("operation", [
    ProposalItemBaseSchema.extend({
        operation: z.literal("add_node"),
        payload: z.object({
            key: z.string(),
            type: z.string(),
            name: z.string(),
            status: NodeStatusSchema,
            ref: NodeRefSchema.nullable(),
            metadata: MetadataSchema,
        }),
    }),
    ProposalItemBaseSchema.extend({
        operation: z.literal("update_node"),
        payload: z.object({
            nodeId: z.string(),
            type: z.string().optional(),
            name: z.string().optional(),
            status: NodeStatusSchema.optional(),
            metadata: MetadataSchema.optional(),
        }),
    }),
    ProposalItemBaseSchema.extend({
        operation: z.literal("remove_node"),
        payload: z.object({ nodeId: z.string() }),
    }),
    ProposalItemBaseSchema.extend({
        operation: z.literal("add_edge"),
        payload: z.object({
            source: z.string(),
            target: z.string(),
            relation: RelationSchema,
            metadata: MetadataSchema,
        }),
    }),
    ProposalItemBaseSchema.extend({
        operation: z.literal("remove_edge"),
        payload: z.object({ edgeId: z.string() }),
    }),
]);

export const ProposalSchema = z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string().nullable(),
    status: z.enum(["draft", "applied", "rejected", "superseded"]),
    createdBy: z.string(),
    createdAt: z.string(),
    reviewedAt: z.string().nullable(),
    items: z.array(ProposalItemSchema),
});

export const proposalListSchema = z.object({ proposals: z.array(ProposalSchema) });
export const proposalReviewedSchema = z.object({ proposal: ProposalSchema, failedCount: z.number().optional() });
