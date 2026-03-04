import { ChevronLeft, ChevronRight, Rewind } from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {NothingFound} from "@/components/nothing-found.tsx";
import {SessionCard, SessionCardSkeleton} from "@/feature/tracked-user/components/session-card.tsx";
import {GetSessionsResponse} from "@/api/analytics/endpoints/sessions.ts";

interface SessionsListProps {
    sessions: GetSessionsResponse;
    isLoading: boolean;
    page: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    emptyMessage?: string;
    userId?: string;
    headerElement?: React.ReactNode;
    pageSize?: number;
}

export function SessionsList({
                                 sessions,
                                 isLoading,
                                 page,
                                 onPageChange,
                                 hasNextPage,
                                 hasPrevPage,
                                 emptyMessage = "Try a different date range or filter",
                                 userId,
                                 headerElement,
                                 pageSize,
                             }: SessionsListProps) {
    return (
        <div className="space-y-3">
            {/* Header and pagination controls */}
            <div className="flex items-center justify-between gap-2">
                {headerElement}
                <div className="flex items-center justify-end gap-2 ml-auto">
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Page {page}</span>
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={!hasNextPage}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {sessions.length === 0 && !isLoading && (
                <NothingFound icon={<Rewind className="w-10 h-10" />} title={"No sessions found"} description={emptyMessage} />
            )}

            {/* Session cards */}
            {isLoading ? (
                <SessionCardSkeleton userId={userId} count={pageSize} />
            ) : (
                sessions.map((session, index) => (
                    <SessionCard key={`${session.sessionId}-${index}`} session={session} userId={userId} />
                ))
            )}
        </div>
    );
}
