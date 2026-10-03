import api from "@/api/axios.ts";
import { notificationFeedSchema } from "@/api/notifications/schema.ts";

export async function fetchNotifications(limit = 50, offset = 0) {
    const response = await api.get("/notifications", { params: { limit, offset } });
    return notificationFeedSchema.parse(response.data.data);
}

export async function markNotificationRead(alertId: string) {
    await api.patch(`/notifications/${alertId}/read`);
}

export async function markAllNotificationsRead() {
    await api.patch("/notifications/read-all");
}
