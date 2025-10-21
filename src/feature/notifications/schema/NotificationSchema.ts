import {z} from "zod";

export const NotificationSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    url: z.string().url(),
    providers: z.array(z.string()).default([]),
    lastFetchedAt: z.string().datetime().optional(),
});

export type NotificationTypeSchema = z.infer<typeof NotificationSchema>;

/* =====================
   PROVIDER CONFIG TYPES
   ===================== */

export const DiscordConfigSchema = z.object({
    type: z.literal("discord"),
    webhookUrl: z.string().url(),
});

export const TelegramConfigSchema = z.object({
    type: z.literal("telegram"),
    botToken: z.string(),
    chatId: z.string(),
});

export const EmailConfigSchema = z.object({
    type: z.literal("email"),
    address: z.string().email(),
});

export const WebhookConfigSchema = z.object({
    type: z.literal("webhook"),
    url: z.string().url(),
    headers: z.record(z.string()).optional(),
});

export const ProviderConfigSchema = z.union([
    DiscordConfigSchema,
    TelegramConfigSchema,
    EmailConfigSchema,
    WebhookConfigSchema,
]);

/* =====================
   PROVIDER SCHEMA
   ===================== */

export const ProviderTypeSchema = z.enum([
    "discord",
    "telegram",
    "email",
    "webhook",
]);

export const ProviderSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: ProviderTypeSchema,
    config: ProviderConfigSchema,
});

/* =====================
   EXPORT TYPES
   ===================== */

export type Provider = z.infer<typeof ProviderSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

/* =====================
   Create Schemas
   ===================== */

export const notificationCreateSchema = z.object({
    name: z.string().min(1, 'Name must be at least 3 characters long'),
    url: z.string().url('RSS Feed must be a valid URL'),
    providers: z.array(z.number()).nonempty( 'At least 1 Provider must be selected'),
});
