import { Provider } from "@/feature/notifications/schema/NotificationSchema";

export const dummyProviders: Provider[] = [
    {
        id: 1,
        name: "Tech Discord",
        type: "discord",
        config: {
            type: "discord",
            webhookUrl: "https://discord.com/api/webhooks/123456789/example",
        },
    },
    {
        id: 2,
        name: "News Telegram",
        type: "telegram",
        config: {
            type: "telegram",
            botToken: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
            chatId: "987654321",
        },
    },
    {
        id: 3,
        name: "Daily Mail",
        type: "email",
        config: {
            type: "email",
            address: "news@dailyupdates.com",
        },
    },
    {
        id: 4,
        name: "Webhook Monitor",
        type: "webhook",
        config: {
            type: "webhook",
            url: "https://api.example.com/hooks/notify",
            headers: {
                Authorization: "Bearer 123abc456",
            },
        },
    },
];
