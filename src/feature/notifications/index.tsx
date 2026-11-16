import { useState } from "react";
import { CheckCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { PageContainer, PageHeader, PageToolbar } from "@/components/layout/page.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/api/notifications/hooks.ts";
import { NotificationItem } from "@/feature/notifications/components/NotificationItem.tsx";

const PAGE_LIMIT = 100;

export default function Notifications() {
    const [tab, setTab] = useState<"all" | "unread">("all");
    const notificationsQuery = useNotifications(PAGE_LIMIT);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const notifications = notificationsQuery.data?.notifications ?? [];
    const visible = tab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
    const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

    return (
        <PageContainer title="Benachrichtigungen" width="narrow">
            <PageHeader
                title="Benachrichtigungen"
                description="Meldungen aus Homelab, API und Diensten. Ein Klick markiert eine Meldung als gelesen."
                actions={
                    unreadCount > 0 ? (
                        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
                            <CheckCheck />
                            Alle als gelesen markieren
                        </Button>
                    ) : undefined
                }
            />

            <PageToolbar>
                <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
                    <TabsList>
                        <TabsTrigger value="all">Alle</TabsTrigger>
                        <TabsTrigger value="unread">Ungelesen{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </PageToolbar>

            {notificationsQuery.isError ? (
                <ErrorState
                    title="Benachrichtigungen konnten nicht geladen werden"
                    error={notificationsQuery.error}
                    onRetry={() => notificationsQuery.refetch()}
                />
            ) : (
                <Card>
                    <CardContent className="p-2">
                        {notificationsQuery.isPending ? (
                            <div className="space-y-1 p-1" aria-busy="true" aria-label="Wird geladen">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="flex items-start gap-3 p-2">
                                        <Skeleton className="size-8 rounded-lg" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : visible.length === 0 ? (
                            <EmptyState
                                variant="plain"
                                icon={ShieldCheck}
                                title={tab === "unread" ? "Alles gelesen" : "Keine Benachrichtigungen"}
                                description={tab === "unread" ? "Es gibt keine ungelesenen Meldungen." : undefined}
                            />
                        ) : (
                            <ul className="space-y-0.5">
                                {visible.map((notification) => (
                                    <li key={notification.id}>
                                        <NotificationItem notification={notification} onRead={(alertId) => markRead.mutate(alertId)} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            )}
        </PageContainer>
    );
}
