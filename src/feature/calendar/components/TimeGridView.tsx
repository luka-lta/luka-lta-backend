import { DateTime } from "luxon";
import { cn } from "@/lib/utils.ts";
import type { CalendarEvent } from "@/api/calendar/schema.ts";
import { allDayEventsOnDay, layoutDayEvents } from "@/feature/calendar/calendarGrid.ts";
import { EventChip } from "@/feature/calendar/components/EventChip.tsx";

const HOUR_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimeGridViewProps {
    days: DateTime[];
    events: CalendarEvent[];
    onSelectEvent: (event: CalendarEvent) => void;
}

export function TimeGridView({ days, events, onSelectEvent }: TimeGridViewProps) {
    const now = DateTime.now();
    const allDayByDay = days.map((day) => allDayEventsOnDay(events, day));
    const hasAnyAllDay = allDayByDay.some((list) => list.length > 0);

    return (
        <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(96px, 1fr))` }}>
                <div />
                {days.map((day) => {
                    const isToday = day.hasSame(now, "day");
                    const isWeekend = day.weekday >= 6;
                    return (
                        <div
                            key={day.toISODate()}
                            className={cn(
                                "border-b px-2 py-2 text-center text-sm",
                                isWeekend && "text-muted-foreground",
                            )}
                        >
                            <div className="text-xs text-muted-foreground">{day.setLocale("de").toFormat("ccc")}</div>
                            <div
                                className={cn(
                                    "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full font-medium",
                                    isToday && "bg-primary text-primary-foreground",
                                )}
                            >
                                {day.day}
                            </div>
                        </div>
                    );
                })}

                {hasAnyAllDay && (
                    <>
                        <div className="border-b py-1 pr-2 text-right text-[10px] text-muted-foreground">Ganztägig</div>
                        {allDayByDay.map((list, i) => (
                            <div key={days[i].toISODate()} className="space-y-0.5 border-b border-l p-1">
                                {list.map((event) => (
                                    <EventChip key={event.id} event={event} onClick={onSelectEvent} />
                                ))}
                            </div>
                        ))}
                    </>
                )}

                <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
                    {HOURS.map((hour) => (
                        <div
                            key={hour}
                            className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground"
                            style={{ top: hour * HOUR_HEIGHT }}
                        >
                            {hour > 0 && `${String(hour).padStart(2, "0")}:00`}
                        </div>
                    ))}
                </div>

                {days.map((day) => {
                    const isToday = day.hasSame(now, "day");
                    const positioned = layoutDayEvents(events, day);

                    return (
                        <div
                            key={day.toISODate()}
                            className={cn("relative border-l", isToday && "bg-primary/[0.03]")}
                            style={{ height: HOURS.length * HOUR_HEIGHT }}
                        >
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="absolute w-full border-t"
                                    style={{ top: hour * HOUR_HEIGHT }}
                                />
                            ))}

                            {isToday && (
                                <div
                                    className="absolute z-10 h-px w-full bg-rose-500"
                                    style={{ top: `${(now.diff(now.startOf("day"), "minutes").minutes / 1440) * 100}%` }}
                                >
                                    <span className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-rose-500" />
                                </div>
                            )}

                            {positioned.map(({ event, top, height, column, columns }) => (
                                <div
                                    key={event.id}
                                    className="absolute px-0.5"
                                    style={{
                                        top: `${top}%`,
                                        height: `${height}%`,
                                        left: `${(column / columns) * 100}%`,
                                        width: `${100 / columns}%`,
                                    }}
                                >
                                    <EventChip event={event} onClick={onSelectEvent} className="h-full items-start" />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
