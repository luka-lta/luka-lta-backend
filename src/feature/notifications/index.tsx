import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/api/notifications/hooks.ts";
import { NotificationItem } from "@/feature/notifications/components/NotificationItem.tsx";

const PAGE_LIMIT = 100;

export default function Notifications() {
    const [tab, setTab] = useState<"all" | "unread">("all");
    const { data, isLoading } = useNotifications(PAGE_LIMIT);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const notifications = data?.notifications ?? [];
    const visible = tab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
    const unreadCount = data?.unreadCount ?? 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Benachrichtigungen</CardTitle>
                <div className="flex items-center gap-2">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
                        <TabsList>
                            <TabsTrigger value="all">Alle</TabsTrigger>
                            <TabsTrigger value="unread">Ungelesen{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
                            Alles gelesen
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!isLoading && visible.length === 0 ? (
                    <Empty className="border-0 py-12">
                        <EmptyMedia variant="icon">
                            <ShieldCheck />
                        </EmptyMedia>
                        <EmptyTitle>{tab === "unread" ? "Keine ungelesenen Benachrichtigungen" : "Keine Benachrichtigungen"}</EmptyTitle>
                    </Empty>
                ) : (
                    <ul className="space-y-1">
                        {visible.map((notification) => (
                            <li key={notification.id}>
                                <NotificationItem
                                    notification={notification}
                                    onRead={(alertId) => markRead.mutate(alertId)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
