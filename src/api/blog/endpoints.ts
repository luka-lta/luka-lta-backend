import {z} from "zod";
import api from "@/api/axios.ts";
import {BlogPostSchema, BlogPostType, blogListSchema, tagListSchema} from "@/feature/blog/schema/BlogSchema.ts";

const blogPostResponseSchema = z.object({post: BlogPostSchema});

export interface BlogPostInput {
    title: string;
    excerpt: string | null;
    content: string;
    tag_ids: number[];
}

export async function fetchBlogList(filterData: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filterData)) {
        if (value !== undefined && value !== null && value !== 'undefined') {
            params.set(key, String(value));
        }
    }

    const response = await api.get(`/blog?${params.toString()}`);
    return blogListSchema.parse(response.data.data);
}

export async function fetchBlogPost(blogId: string) {
    const response = await api.get(`/blog/${blogId}`);
    return blogPostResponseSchema.parse(response.data.data).post;
}

export async function fetchBlogTags() {
    const response = await api.get('/blog/tags');
    return tagListSchema.parse(response.data.data);
}

export async function createBlogPost(data: BlogPostInput): Promise<BlogPostType> {
    const response = await api.post('/blog', data);
    return blogPostResponseSchema.parse(response.data.data).post;
}

export async function updateBlogPost(blogId: string, data: BlogPostInput): Promise<void> {
    await api.put(`/blog/${blogId}`, data);
}

export async function togglePublishBlogPost(blogId: string, published: boolean): Promise<void> {
    await api.patch(`/blog/${blogId}/publish`, {published});
}

export async function deleteBlogPost(blogId: string): Promise<void> {
    await api.delete(`/blog/${blogId}`);
}

export async function createBlogTag(name: string): Promise<void> {
    await api.post('/blog/tags', {name});
}

export async function deleteBlogTag(tagId: number): Promise<void> {
    await api.delete(`/blog/tags/${tagId}`);
}
