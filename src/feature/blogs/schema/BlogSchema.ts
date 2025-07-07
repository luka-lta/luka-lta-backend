import {z} from "zod";

const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const BlogItemSchema = z.object({
    blogId: z.string().uuid(),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    userId: z.number(),
    isPublished: z.boolean(),
    createdAt: z.string().refine(
        (val) => datetimeRegex.test(val),
        {
            message: "createdAt muss im Format YYYY-MM-DD HH:mm:ss sein",
        }
    ),
    updatedAt: z.string().nullable()
});

export type BlogItemTypeSchema = z.infer<typeof BlogItemSchema>;

export const blogListSchema = z.object({
    blog: z.array(BlogItemSchema)
});

export const blogDetailSchema = z.object({
    blog: BlogItemSchema,
});