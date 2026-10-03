import { DateTime } from "luxon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { CalendarDays, CalendarOff, ExternalLink } from "lucide-react";
import { useCalendarSummary } from "@/api/calendar/hooks.ts";
import { formatCountdown, getCurrentEvent, getUpcomingEvents, parseEventTime } from "@/feature/dashboard/widgets/calendarData.ts";
import { cn } from "@/lib/utils.ts";

interface CalendarCardProps {
    onOpenDetail: () => void;
}

export function CalendarCard({ onOpenDetail }: CalendarCardProps) {
    const { data, isPending, isError, refetch } = useCalendarSummary();
    const now = DateTime.now();

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Kalender
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onOpenDetail}>
                    Ansicht
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
                    <Empty className="border-0 py-6">
                        <EmptyMedia variant="icon">
                            <CalendarOff className="text-amber-500" />
                        </EmptyMedia>
                        <EmptyTitle>Kalender momentan nicht erreichbar</EmptyTitle>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                            Erneut versuchen
                        </Button>
                    </Empty>
                )}

                {!isPending && !isError && data?.status === "not_configured" && (
                    <Empty className="border-0 py-6">
                        <EmptyMedia variant="icon">
                            <CalendarOff />
                        </EmptyMedia>
                        <EmptyTitle>Kein Kalender konfiguriert</EmptyTitle>
                        <EmptyDescription>Eine ICS-Kalender-Quelle kann in den Einstellungen hinzugefügt werden.</EmptyDescription>
                    </Empty>
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
            <Empty className="border-0 py-6">
                <EmptyMedia variant="icon">
                    <CalendarDays />
                </EmptyMedia>
                <EmptyTitle>Keine Termine heute</EmptyTitle>
            </Empty>
        );
    }

    return (
        <div className="space-y-3">
            {current && (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        Gerade aktiv
                    </div>
                    <p className="mt-1.5 font-medium">{current.title}</p>
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
                        <span className="text-muted-foreground shrink-0">{event.durationMinutes} min</span>
                    </li>
                ))}
            </ul>

            {upcoming.length === 0 && !current && (
                <p className="text-sm text-muted-foreground">Keine weiteren Termine heute.</p>
            )}

            {upcoming[0] && (
                <p className={cn("text-sm font-medium pt-1 border-t")}>
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
