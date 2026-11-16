import { CircleAlert, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { formatRel } from "@/lib/dateTimeUtils.ts";
import type { Notification } from "@/api/notifications/schema.ts";

interface NotificationItemProps {
    notification: Notification;
    onRead: (alertId: string) => void;
}

const SEVERITY_CONFIG: Record<Notification["severity"], { icon: typeof CircleAlert; className: string }> = {
    critical: { icon: OctagonAlert, className: "bg-destructive/10 text-destructive" },
    warning: { icon: CircleAlert, className: "bg-warning/10 text-warning" },
    info: { icon: Info, className: "bg-info/10 text-info" },
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const config = SEVERITY_CONFIG[notification.severity];
    const Icon = config.icon;

    return (
        <button
            type="button"
            onClick={() => !notification.isRead && onRead(notification.id)}
            className={cn(
                "flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors duration-fast hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !notification.isRead && "bg-primary/5",
            )}
        >
            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", config.className)}>
                <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.title}</p>
                {notification.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                    {notification.source} · {formatRel(notification.lastOccurredAt)}
                    {notification.occurrenceCount > 1 && ` · ${notification.occurrenceCount}×`}
                </p>
            </div>
            {!notification.isRead && (
                <>
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span className="sr-only">Ungelesen – zum Markieren als gelesen anklicken</span>
                </>
            )}
        </button>
    );
}
