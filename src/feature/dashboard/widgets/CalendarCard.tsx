import { DateTime } from "luxon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { CalendarDays, CalendarOff, ChevronRight, ExternalLink } from "lucide-react";
import { useCalendarSummary } from "@/api/calendar/hooks.ts";
import { formatCountdown, getCurrentEvent, getUpcomingEvents, parseEventTime } from "@/feature/dashboard/widgets/calendarData.ts";

interface CalendarCardProps {
    onOpenDetail: () => void;
}

export function CalendarCard({ onOpenDetail }: CalendarCardProps) {
    const { data, isPending, isError, refetch } = useCalendarSummary();
    const now = DateTime.now();

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                    Heute
                </CardTitle>
                <Button variant="ghost" size="sm" className="-mr-2 text-muted-foreground" onClick={onOpenDetail}>
                    Kalender
                    <ChevronRight />
                </Button>
            </CardHeader>
            <CardContent>
                {isPending && (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                )}

                {isError && !isPending && (
                    <EmptyState
                        variant="plain"
                        className="py-6"
                        icon={CalendarOff}
                        title="Kalender gerade nicht erreichbar"
                        action={<Button variant="outline" size="sm" onClick={() => refetch()}>Erneut versuchen</Button>}
                    />
                )}

                {!isPending && !isError && data?.status === "not_configured" && (
                    <EmptyState
                        variant="plain"
                        className="py-6"
                        icon={CalendarOff}
                        title="Kein Kalender verbunden"
                        description="Binde auf der Kalender-Seite einen ICS-Kalender ein."
                        action={<Button variant="outline" size="sm" onClick={onOpenDetail}>Kalender hinzufügen</Button>}
                    />
                )}

                {!isPending && !isError && data && data.status !== "not_configured" && (
                    <CalendarCardBody events={data.events} now={now} />
                )}
            </CardContent>
        </Card>
    );
}

function CalendarCardBody({ events, now }: { events: NonNullable<ReturnType<typeof useCalendarSummary>["data"]>["events"]; now: DateTime }) {
    const current = getCurrentEvent(events, now);
    const upcoming = getUpcomingEvents(events, now);

    if (events.length === 0) {
        return (
            <EmptyState variant="plain" className="py-6" icon={CalendarDays} title="Keine Termine heute" />
        );
    }

    return (
        <div className="space-y-3">
            {current && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <StatusBadge tone="info" pulse>Läuft gerade</StatusBadge>
                    <p className="mt-2 font-medium">{current.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {parseEventTime(current.startsAt).toFormat("HH:mm")} – {parseEventTime(current.endsAt).toFormat("HH:mm")}
                        {" · Noch "}
                        {formatCountdown(parseEventTime(current.endsAt), now)}
                    </p>
                </div>
            )}

            <ul className="space-y-2">
                {upcoming.slice(0, 4).map((event) => (
                    <li key={event.id} className="flex items-start justify-between gap-3 text-sm">
                        <div className="flex items-start gap-3 min-w-0">
                            <span className="font-medium tabular-nums shrink-0">{parseEventTime(event.startsAt).toFormat("HH:mm")}</span>
                            <span className="truncate">{event.title}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{event.durationMinutes} Min.</span>
                    </li>
                ))}
            </ul>

            {upcoming.length === 0 && !current && (
                <p className="text-sm text-muted-foreground">Keine weiteren Termine heute.</p>
            )}

            {upcoming[0] && (
                <p className="border-t pt-3 text-sm font-medium">
                    Nächster Termin in {formatCountdown(parseEventTime(upcoming[0].startsAt), now)}
                </p>
            )}

            {upcoming[0]?.url && (
                <a
                    href={upcoming[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    <ExternalLink className="h-3 w-3" />
                    Meeting-Link
                </a>
            )}
        </div>
    );
}
