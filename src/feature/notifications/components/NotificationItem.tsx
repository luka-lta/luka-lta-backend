import { CircleAlert, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { formatRel } from "@/lib/dateTimeUtils.ts";
import type { Notification } from "@/api/notifications/schema.ts";

interface NotificationItemProps {
    notification: Notification;
    onRead: (alertId: string) => void;
}

const SEVERITY_CONFIG: Record<Notification["severity"], { icon: typeof CircleAlert; className: string }> = {
    critical: { icon: OctagonAlert, className: "text-rose-500 bg-rose-500/10" },
    warning: { icon: CircleAlert, className: "text-amber-500 bg-amber-500/10" },
    info: { icon: Info, className: "text-sky-500 bg-sky-500/10" },
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const config = SEVERITY_CONFIG[notification.severity];
    const Icon = config.icon;

    return (
        <button
            type="button"
            onClick={() => !notification.isRead && onRead(notification.id)}
            className={cn(
                "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted/50",
                !notification.isRead && "bg-muted/30",
            )}
        >
            <div className={cn("rounded-md p-1.5 shrink-0", config.className)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.title}</p>
                {notification.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                    {notification.source} · {formatRel(notification.lastOccurredAt)}
                    {notification.occurrenceCount > 1 && ` · ${notification.occurrenceCount}x`}
                </p>
            </div>
            {!notification.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
        </button>
    );
}
