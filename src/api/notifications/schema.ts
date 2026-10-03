import { z } from "zod";

export const NotificationSchema = z.object({
    id: z.string(),
    source: z.string(),
    sourceId: z.string().nullable(),
    type: z.string(),
    severity: z.enum(["critical", "warning", "info"]),
    title: z.string(),
    description: z.string(),
    context: z.record(z.string(), z.unknown()),
    occurrenceCount: z.number(),
    firstOccurredAt: z.string(),
    lastOccurredAt: z.string(),
    resolvedAt: z.string().nullable(),
    isRead: z.boolean(),
});

export const notificationFeedSchema = z.object({
    notifications: z.array(NotificationSchema),
    unreadCount: z.number(),
});

export type Notification = z.infer<typeof NotificationSchema>;
