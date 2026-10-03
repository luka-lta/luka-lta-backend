import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/api/notifications/hooks.ts";
import { NotificationItem } from "@/feature/notifications/components/NotificationItem.tsx";

const PREVIEW_LIMIT = 8;

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { data } = useNotifications(PREVIEW_LIMIT);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const notifications = data?.notifications ?? [];
    const unreadCount = data?.unreadCount ?? 0;
    const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                            {badgeLabel}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between p-3">
                    <p className="text-sm font-semibold">Benachrichtigungen</p>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                            Alles gelesen
                        </Button>
                    )}
                </div>
                <Separator />
                {notifications.length === 0 ? (
                    <Empty className="border-0 py-8">
                        <EmptyMedia variant="icon">
                            <ShieldCheck />
                        </EmptyMedia>
                        <EmptyTitle>Keine Benachrichtigungen</EmptyTitle>
                    </Empty>
                ) : (
                    <ScrollArea className="max-h-96">
                        <div className="p-2 space-y-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={(alertId) => markRead.mutate(alertId)}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                )}
                <Separator />
                <Link
                    to="/dashboard/notifications"
                    onClick={() => setOpen(false)}
                    className="block p-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Alle Benachrichtigungen →
                </Link>
            </PopoverContent>
        </Popover>
    );
}
