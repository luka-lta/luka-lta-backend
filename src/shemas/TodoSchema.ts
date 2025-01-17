import {z} from 'zod';

export const TodoSchema = z.object({
    id: z.number(),
    ownerId: z.number(),
    title: z.string().min(2),
    description: z.string().optional().nullable(),
    status: z.enum(["todo", "in-progress", "done", "all"]).default("todo"),
    priority: z.enum(["low", "medium", "high", "all"]).default("medium"),
    dueDate: z.string().optional().nullable(),
    createdAt: z.string().optional().nullable(),
    updatedAt: z.string().optional().nullable(),
});

export const TodoFormSchema = z.object({
    title: TodoSchema.shape.title,
    description: TodoSchema.shape.description,
    status: TodoSchema.shape.status,
    priority: TodoSchema.shape.priority,
    dueDate: TodoSchema.shape.dueDate,
});

export type TodoTypeSchema = z.infer<typeof TodoSchema>;