import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    applyTopologyProposal,
    createTopologyEdge,
    CreateTopologyEdgeInput,
    createTopologyNode,
    CreateTopologyNodeInput,
    deleteTopologyEdge,
    deleteTopologyNode,
    fetchTopologyGraph,
    fetchTopologyProposals,
    rejectTopologyProposal,
    updateTopologyNode,
    UpdateTopologyNodeInput,
} from "@/api/homelab/topologyEndpoints.ts";

const REFRESH_INTERVAL_MS = 30_000;

const TOPOLOGY_KEY = ["homelab", "topology"];
const PROPOSALS_KEY = ["homelab", "topology", "proposals"];

export function useTopologyGraph() {
    return useQuery({
        queryKey: TOPOLOGY_KEY,
        queryFn: fetchTopologyGraph,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

export function useTopologyProposals() {
    return useQuery({
        queryKey: PROPOSALS_KEY,
        queryFn: fetchTopologyProposals,
        refetchInterval: REFRESH_INTERVAL_MS,
    });
}

/** Invalidiert Graph und Proposals (gemeinsamer Präfix). */
function useInvalidateTopology() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: TOPOLOGY_KEY });
}

export function useCreateTopologyNode() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (data: CreateTopologyNodeInput) => createTopologyNode(data),
        onSuccess: invalidate,
    });
}

export function useUpdateTopologyNode() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: ({ nodeId, data }: { nodeId: string; data: UpdateTopologyNodeInput }) =>
            updateTopologyNode(nodeId, data),
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

export function useApplyTopologyProposal() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: ({ proposalId, acceptedItemIds }: { proposalId: string; acceptedItemIds: string[] }) =>
            applyTopologyProposal(proposalId, acceptedItemIds),
        onSuccess: invalidate,
    });
}

export function useRejectTopologyProposal() {
    const invalidate = useInvalidateTopology();
    return useMutation({
        mutationFn: (proposalId: string) => rejectTopologyProposal(proposalId),
        onSuccess: invalidate,
    });
}
