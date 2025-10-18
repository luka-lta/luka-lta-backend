import {z} from "zod";

export const NotificationSchema = z.object({
    notificationId: z.number(),
    rssFeedUrl: z.string().url(),
    provider: z.string(),
})

export type NotificationTypeSchema = z.infer<typeof NotificationSchema>;