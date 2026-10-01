import api from "@/api/axios.ts";
import { topologyEdgeCreatedSchema, topologyGraphSchema, topologyNodeCreatedSchema } from "@/api/homelab/topologySchema.ts";
import type { EntityType, EdgeRelation } from "@/feature/homelab/topology/types.ts";

export interface CreateTopologyNodeInput {
    type: string;
    name: string;
    status?: string;
    metadata?: Record<string, unknown>;
}

export interface CreateTopologyEdgeInput {
    sourceType: EntityType;
    sourceId: string;
    targetType: EntityType;
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

export async function updateHostNodeType(hostId: string, nodeType: string): Promise<void> {
    await api.patch(`/homelab/hosts/${hostId}`, { nodeType });
}

export async function updateContainerNodeRole(containerId: string, nodeRole: string | null): Promise<void> {
    await api.patch(`/homelab/containers/${containerId}/role`, { nodeRole });
}
