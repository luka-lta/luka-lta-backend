import type { MouseEvent } from "react";
import { cn } from "@/lib/utils.ts";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import { parseEventTime } from "@/feature/calendar/calendarGrid.ts";

interface EventChipProps {
    event: CalendarEvent;
    onClick: (event: CalendarEvent, domEvent: MouseEvent) => void;
    className?: string;
}

/** Small colored chip for a month-grid cell — dot+time+title for timed events, a filled bar for all-day ones. */
export function EventChip({ event, onClick, className }: EventChipProps) {
    const color = event.color ?? "#64748b";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick(event, e);
            }}
            className={cn(
                "flex w-full items-center gap-1 truncate rounded-sm px-1 py-0.5 text-left text-[11px] hover:opacity-80",
                className,
            )}
            style={
                event.isAllDay
                    ? { backgroundColor: color, color: "#fff" }
                    : { backgroundColor: `${color}1f` }
            }
        >
            {!event.isAllDay && (
                <>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                        {parseEventTime(event.startsAt).toFormat("HH:mm")}
                    </span>
                </>
            )}
            <span className="truncate">{event.title}</span>
        </button>
    );
}
