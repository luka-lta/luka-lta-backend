import api from "@/api/axios.ts";
import {
    proposalListSchema,
    proposalReviewedSchema,
    topologyEdgeCreatedSchema,
    topologyGraphSchema,
    topologyNodeCreatedSchema,
} from "@/api/homelab/topologySchema.ts";
import type { EdgeRelation, NodeStatus } from "@/feature/homelab/topology/types.ts";

export interface CreateTopologyNodeInput {
    type: string;
    name: string;
    status?: NodeStatus;
    ref?: { type: "host"; hostId: string } | { type: "service"; hostId: string; serviceKey: string };
    metadata?: Record<string, unknown>;
}

export interface UpdateTopologyNodeInput {
    type?: string;
    name?: string;
    status?: NodeStatus;
}

export interface CreateTopologyEdgeInput {
    sourceId: string;
    targetId: string;
    relation: EdgeRelation;
    metadata?: Record<string, unknown>;
}

export async function fetchTopologyGraph() {
    const response = await api.get("/homelab/topology");
    return topologyGraphSchema.parse(response.data.data);
}

export async function createTopologyNode(data: CreateTopologyNodeInput) {
    const response = await api.post("/homelab/topology/nodes", data);
    return topologyNodeCreatedSchema.parse(response.data.data).node;
}

export async function updateTopologyNode(nodeId: string, data: UpdateTopologyNodeInput) {
    const response = await api.patch(`/homelab/topology/nodes/${nodeId}`, data);
    return topologyNodeCreatedSchema.parse(response.data.data).node;
}

export async function deleteTopologyNode(nodeId: string): Promise<void> {
    await api.delete(`/homelab/topology/nodes/${nodeId}`);
}

export async function createTopologyEdge(data: CreateTopologyEdgeInput) {
    const response = await api.post("/homelab/topology/edges", data);
    return topologyEdgeCreatedSchema.parse(response.data.data).edge;
}

export async function deleteTopologyEdge(edgeId: string): Promise<void> {
    await api.delete(`/homelab/topology/edges/${edgeId}`);
}

export async function fetchTopologyProposals() {
    const response = await api.get("/homelab/topology/proposals");
    return proposalListSchema.parse(response.data.data).proposals;
}

export async function applyTopologyProposal(proposalId: string, acceptedItemIds: string[]) {
    const response = await api.post(`/homelab/topology/proposals/${proposalId}/apply`, { acceptedItemIds });
    return proposalReviewedSchema.parse(response.data.data);
}

export async function rejectTopologyProposal(proposalId: string) {
    const response = await api.post(`/homelab/topology/proposals/${proposalId}/reject`);
    return proposalReviewedSchema.parse(response.data.data).proposal;
}
