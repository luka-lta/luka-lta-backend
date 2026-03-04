import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {ArrowRight, Link} from "lucide-react";
import { useMemo, useState } from "react";
import {GetSessionsResponse, SessionEvent} from "@/api/analytics/endpoints/sessions.ts";
import {useParams} from "react-router-dom";
import {useGetSessionDetailsInfinite} from "@/api/analytics/hooks/useGetTrackingUserSessions.ts";
import {Button} from "@/components/ui/button.tsx";
import {SessionDetailsTimelineSkeleton} from "@/feature/tracked-user/components/session-details-timeline-skeleton.tsx";
import {TimelineTab} from "@/feature/tracked-user/components/timeline-tab.tsx";
import {SessionInfoTab} from "@/feature/tracked-user/components/session-info.tsx";

interface SessionDetailsProps {
    session: GetSessionsResponse[number];
    userId?: string;
    highlightedEventTimestamp?: number;
}

export function SessionDetails({ session, userId, highlightedEventTimestamp }: SessionDetailsProps) {
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useGetSessionDetailsInfinite(session.sessionId);

    const { site } = useParams();

    // Flatten all events into a single array
    const allEvents = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.events || []);
    }, [data?.pages]);

    // Get session details from the first page
    const sessionDetails = data?.pages[0]?.session;


    // Event type filter state
    const [visibleEventTypes, setVisibleEventTypes] = useState<Set<string>>(
        new Set([
            "pageview",
            "custom_event",
            "outbound",
            "button_click",
            "copy",
            "form_submit",
            "input_change",
        ])
    );

    const toggleEventType = (type: string) => {
        setVisibleEventTypes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    // Filter events based on visible types
    const filteredEvents = useMemo(() => {
        return allEvents.filter((event: SessionEvent) =>
            visibleEventTypes.has(event.type)
        );
    }, [allEvents, visibleEventTypes]);

    return (
        <div className="px-4 dark:border-neutral-850">
            {isLoading ? (
                <SessionDetailsTimelineSkeleton
                    itemCount={session.pageviews + session.events}
                />
            ) : error ? (
                <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                        Error loading session details. Please try again.
                    </AlertDescription>
                </Alert>
            ) : data?.pages[0] ? (
                <Tabs defaultValue="timeline" className="mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="info">Session Info</TabsTrigger>
                        </TabsList>
                        {!userId && (
                            <Link
                                to={`/${site}/user/${encodeURIComponent(
                                   session.userId
                                )}`}
                            >
                                <Button size={"sm"} variant={"default"}>
                                    View User <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                    </div>

                    <TabsContent value="timeline">
                        <TimelineTab
                            highlightedEventTimestamp={highlightedEventTimestamp}
                            allEvents={allEvents}
                            filteredEvents={filteredEvents}
                            visibleEventTypes={visibleEventTypes}
                            onToggleEventType={toggleEventType}
                            sessionEnd={sessionDetails?.sessionEnd}
                            hasNextPage={hasNextPage ?? false}
                            isFetchingNextPage={isFetchingNextPage}
                            fetchNextPage={fetchNextPage}
                            totalEvents={data.pages[0]?.pagination?.total ?? 0}
                        />
                    </TabsContent>

                    <TabsContent value="info" className="mt-4">
                        {sessionDetails && (
                            <SessionInfoTab
                                /*session={session}*/
                                sessionDetails={sessionDetails}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="py-4 text-center text-neutral-400">
                    No data available
                </div>
            )}
        </div>
    );
}
