import type { z } from "zod";
import type {
    InfraEdgeSchema,
    InfraNodeSchema,
    ProposalItemSchema,
    ProposalSchema,
    topologyGraphSchema,
} from "@/api/homelab/topologySchema.ts";

/**
 * A node's `type` is a free-form string (e.g. "server", "raspberry-pi", "database",
 * "reverse-proxy", "internet"). New types need no code changes — see
 * `NODE_TYPE_CONFIG` in constants.ts for how a type maps to an icon/category, and its
 * `fallback` entry for anything not explicitly listed.
 *
 * Every node is curated (by hand or via an applied proposal). A node with `ref` mirrors
 * a host or service reported by the agent and takes over its live status.
 */
export type InfraNodeData = z.infer<typeof InfraNodeSchema>;

export type InfraEdgeData = z.infer<typeof InfraEdgeSchema>;

export type TopologyGraph = z.infer<typeof topologyGraphSchema>;

export type NodeStatus = InfraNodeData["status"];

export type EdgeRelation = InfraEdgeData["relation"];

export type TopologyProposal = z.infer<typeof ProposalSchema>;

export type TopologyProposalItem = z.infer<typeof ProposalItemSchema>;
