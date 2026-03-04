import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import {EventTypeFilter} from "@/components/event-type-filter.tsx";
import {SessionEvent} from "@/api/analytics/endpoints/sessions.ts";
import {Button} from "@/components/ui/button.tsx";
import {PageviewItem} from "@/feature/tracked-user/components/pageview-item.tsx";

interface TimelineTabProps {
    allEvents: SessionEvent[];
    filteredEvents: SessionEvent[];
    visibleEventTypes: Set<string>;
    onToggleEventType: (type: string) => void;
    sessionEnd?: string;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
    totalEvents: number;
    highlightedEventTimestamp?: number;
}

export function TimelineTab({
    highlightedEventTimestamp,
    allEvents,
    filteredEvents,
    visibleEventTypes,
    onToggleEventType,
    sessionEnd,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    totalEvents,
}: TimelineTabProps) {
    const showHostname = useMemo(() => {
        const hostnames = new Set(
            allEvents
                .filter((e) => e.type === "pageview")
                .map((e) => e.hostname)
        );
        return hostnames.size > 1;
    }, [allEvents]);

    return (
        <>
            <div className="mb-4">
                <EventTypeFilter
                    visibleTypes={visibleEventTypes}
                    onToggle={onToggleEventType}
                    events={allEvents}
                />
            </div>
            <div className="mb-4 px-1">
                {filteredEvents.map((pageview: SessionEvent, index: number) => {
                    let nextTimestamp;
                    if (index < filteredEvents.length - 1) {
                        nextTimestamp = filteredEvents[index + 1].occurredOn;
                    } else if (sessionEnd) {
                        nextTimestamp = sessionEnd;
                    }

                    return (
                        <PageviewItem
                            key={`${pageview.occurredOn}-${index}`}
                            item={pageview}
                            index={index}
                            isLast={index === filteredEvents.length - 1 && !hasNextPage}
                            nextTimestamp={nextTimestamp}
                            showHostname={showHostname}
                            highlightedEventTimestamp={highlightedEventTimestamp}
                        />
                    );
                })}

                {hasNextPage && (
                    <div className="flex justify-center mt-6 mb-4">
                        <Button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <span>Load More</span>
                            )}
                        </Button>
                    </div>
                )}

                {totalEvents > 0 && (
                    <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                        Showing {allEvents.length} of {totalEvents} events
                    </div>
                )}
            </div>
        </>
    );
}
