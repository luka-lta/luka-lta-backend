import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
    BlogPostInput,
    createBlogPost,
    createBlogTag,
    deleteBlogPost,
    deleteBlogTag,
    fetchBlogList,
    fetchBlogPost,
    fetchBlogTags,
    togglePublishBlogPost,
    updateBlogPost,
} from "@/api/blog/endpoints.ts";
import {TagType} from "@/feature/blog/schema/BlogSchema.ts";

export function useBlogList() {
    const [filterData, setFilterData] = useState<Record<string, string>>({});

    const queryData = useQuery({
        queryKey: ['blog', 'list', filterData],
        queryFn: () => fetchBlogList(filterData),
    });

    return [queryData, setFilterData] as const;
}

export function useBlogPost(blogId: string) {
    return useQuery({
        queryKey: ['blog', 'detail', blogId],
        queryFn: () => fetchBlogPost(blogId),
        enabled: !!blogId,
    });
}

export function useBlogTags() {
    return useQuery({
        queryKey: ['blog', 'tags'],
        queryFn: fetchBlogTags,
    });
}

export function useCreateBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: BlogPostInput) => createBlogPost(data),
        onSuccess: () => qc.invalidateQueries({queryKey: ['blog', 'list']}),
    });
}

export function useUpdateBlogPost(blogId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: BlogPostInput) => updateBlogPost(blogId, data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['blog', 'list']});
            qc.invalidateQueries({queryKey: ['blog', 'detail', blogId]});
        },
    });
}

export function useTogglePublishBlogPost(blogId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (published: boolean) => togglePublishBlogPost(blogId, published),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['blog', 'list']});
            qc.invalidateQueries({queryKey: ['blog', 'detail', blogId]});
        },
    });
}

export function usePublishBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({blogId, published}: { blogId: string; published: boolean }) =>
            togglePublishBlogPost(blogId, published),
        onSuccess: (_data, {blogId}) => {
            qc.invalidateQueries({queryKey: ['blog', 'list']});
            qc.invalidateQueries({queryKey: ['blog', 'detail', blogId]});
        },
    });
}

export function useDeleteBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (blogId: string) => deleteBlogPost(blogId),
        onSuccess: () => qc.invalidateQueries({queryKey: ['blog', 'list']}),
    });
}

export function useCreateBlogTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => createBlogTag(name),
        onSuccess: () => qc.invalidateQueries({queryKey: ['blog', 'tags']}),
    });
}

export function useDeleteBlogTag() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tag: TagType) => deleteBlogTag(tag.tagId),
        onSuccess: () => qc.invalidateQueries({queryKey: ['blog', 'tags']}),
    });
}
