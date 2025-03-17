import {z} from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    repeatPassword: z.string().min(8),
    previewToken: z.string().min(6),
})
    .refine(data => data.password === data.repeatPassword, {
        path: ["repeatPassword"],
        message: "Passwords do not match",
    })

export type RegisterSchema = z.infer<typeof registerSchema>;