import {z} from "zod";
import {UserSchema} from "@/feature/user/schema/UserSchema.ts";

const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const BlogItemSchema = z.object({
    blogId: z.string().uuid(),
    title: z.string().min(1, "Title is required"),
    excerpt: z.string().nullable(),
    content: z.string().min(1, "Content is required"),
    user: UserSchema,
    isPublished: z.boolean(),
    createdAt: z.string().refine(
        (val) => datetimeRegex.test(val),
        {
            message: "createdAt muss im Format YYYY-MM-DD HH:mm:ss sein",
        }
    ),
    updatedAt: z.string().nullable()
});

export type blogData = {
    title: string,
    excerpt?: string | null,
    content: string,
    isPublished: boolean,
}

export type BlogItemTypeSchema = z.infer<typeof BlogItemSchema>;

export const blogListSchema = z.object({
    blogs: z.array(BlogItemSchema)
});

export const blogDetailSchema = z.object({
    blog: BlogItemSchema,
});