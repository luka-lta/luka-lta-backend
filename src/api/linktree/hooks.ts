import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    activateLink,
    createLink,
    deactivateLink,
    deleteLink,
    fetchLinkDetail,
    fetchLinktreeList,
    LinkEditInput,
    LinkInput,
    updateLink,
} from "@/api/linktree/endpoints.ts";

export function useLinktreeList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['linktree', 'list', filterData],
        queryFn: () => fetchLinktreeList(filterData),
    });

    return [queryData, setFilterData] as const;
}

export function useLinkDetail(linkId: number) {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['linktree', 'detail', linkId, filterData],
        queryFn: () => fetchLinkDetail(linkId, filterData),
    });

    return [queryData, setFilterData] as const;
}

function invalidateLinktree(qc: ReturnType<typeof useQueryClient>, linkId?: number) {
    qc.invalidateQueries({queryKey: ['linktree', 'list']});
    if (linkId !== undefined) {
        qc.invalidateQueries({queryKey: ['linktree', 'detail', linkId]});
    }
}

export function useCreateLink() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: LinkInput) => createLink(data),
        onSuccess: () => invalidateLinktree(qc),
    });
}

export function useUpdateLink(linkId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: LinkInput | LinkEditInput) => updateLink(linkId, data),
        onSuccess: () => invalidateLinktree(qc, linkId),
    });
}

export function useDeactivateLink() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: number) => deactivateLink(linkId),
        onSuccess: (_data, linkId) => invalidateLinktree(qc, linkId),
    });
}

export function useActivateLink() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: number) => activateLink(linkId),
        onSuccess: (_data, linkId) => invalidateLinktree(qc, linkId),
    });
}

export function useDeleteLink() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (linkId: number) => deleteLink(linkId),
        onSuccess: () => invalidateLinktree(qc),
    });
}
