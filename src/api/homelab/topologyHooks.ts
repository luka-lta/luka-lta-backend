import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createTopologyEdge,
    CreateTopologyEdgeInput,
    createTopologyNode,
    CreateTopologyNodeInput,
    deleteTopologyEdge,
    deleteTopologyNode,
    fetchTopologyGraph,
    updateContainerNodeRole,
    updateHostNodeType,
} from "@/api/homelab/topologyEndpoints.ts";

const REFRESH_INTERVAL_MS = 30_000;

export function useTopologyGraph() {
    return useQuery({
        queryKey: ["homelab", "topology"],
        queryFn: fetchTopologyGraph,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

function useInvalidateTopology() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: ["homelab", "topology"] });
}

export function useCreateTopologyNode() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (data: CreateTopologyNodeInput) => createTopologyNode(data),
        onSuccess: invalidate,
    });
}

export function useDeleteTopologyNode() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (nodeId: string) => deleteTopologyNode(nodeId),
        onSuccess: invalidate,
    });
}

export function useCreateTopologyEdge() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (data: CreateTopologyEdgeInput) => createTopologyEdge(data),
        onSuccess: invalidate,
    });
}

export function useDeleteTopologyEdge() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (edgeId: string) => deleteTopologyEdge(edgeId),
        onSuccess: invalidate,
    });
}

export function useUpdateHostNodeType() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: ({ hostId, nodeType }: { hostId: string; nodeType: string }) =>
            updateHostNodeType(hostId, nodeType),
        onSuccess: invalidate,
    });
}

export function useUpdateContainerNodeRole() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: ({ containerId, nodeRole }: { containerId: string; nodeRole: string | null }) =>
            updateContainerNodeRole(containerId, nodeRole),
        onSuccess: invalidate,
    });
}
