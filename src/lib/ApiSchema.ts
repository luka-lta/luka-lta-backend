import {z} from "zod";

export const ApiResponseSchema = z.object({
    status: z.number(),
    message: z.string().optional(),
    data: z.any().optional(),
});

export type ApiSchema = z.infer<typeof ApiResponseSchema>;