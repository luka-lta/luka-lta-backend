import {z} from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: 'Bitte gib deine E-Mail ein' })
        .email({ message: 'Ungültige E-Mail-Adresse' }),
    password: z
        .string()
        .min(1, {
            message: 'Bitte gib dein Passwort ein',
        })
        .min(8, {
            message: 'Das Passwort hat mindestens 8 Zeichen',
        }),
})

export type LoginSchema = z.infer<typeof loginSchema>;