import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Clock, ExternalLink, MapPin, Users } from "lucide-react";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import { parseEventTime } from "@/feature/calendar/calendarGrid.ts";

interface EventDetailDialogProps {
    event: CalendarEvent | null;
    onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, onOpenChange }: EventDetailDialogProps) {
    return (
        <Dialog open={event !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {event && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: event.color ?? "#64748b" }}
                                />
                                <DialogTitle>{event.title}</DialogTitle>
                            </div>
                            <DialogDescription>{event.calendar} · Nur lesbar (externer Kalender)</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2.5">
                                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p>{parseEventTime(event.startsAt).setLocale("de").toFormat("cccc, d. MMMM yyyy")}</p>
                                    <p className="text-muted-foreground">
                                        {event.isAllDay
                                            ? "Ganztägig"
                                            : `${parseEventTime(event.startsAt).toFormat("HH:mm")} – ${parseEventTime(event.endsAt).toFormat("HH:mm")} Uhr`}
                                    </p>
                                </div>
                            </div>

                            {event.location && (
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>{event.location}</span>
                                </div>
                            )}

                            {event.attendees.length > 0 && (
                                <div className="flex items-center gap-2.5">
                                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>{event.attendees.join(", ")}</span>
                                </div>
                            )}

                            {event.description && (
                                <p className="whitespace-pre-wrap text-muted-foreground border-t pt-3">{event.description}</p>
                            )}

                            {event.url && (
                                <a
                                    href={event.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Termin-Link öffnen
                                </a>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
