import { z } from 'zod'

export const TagSchema = z.object({
    tagId: z.number(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.string(),
})

export const BlogPostSchema = z.object({
    blogId: z.string(),
    title: z.string(),
    excerpt: z.string().nullable(),
    content: z.string(),
    contentHtml: z.string(),
    isPublished: z.boolean(),
    tags: z.array(TagSchema).default([]),
    createdAt: z.string(),
    updatedAt: z.string().nullable(),
    user: z.object({
        userId: z.number(),
        username: z.string(),
        email: z.string(),
    }),
})

export const blogListSchema = z.object({ posts: z.array(BlogPostSchema), totalPages: z.number().optional() })
export const tagListSchema  = z.object({ tags: z.array(TagSchema) })

export type BlogPostType = z.infer<typeof BlogPostSchema>
export type TagType      = z.infer<typeof TagSchema>
