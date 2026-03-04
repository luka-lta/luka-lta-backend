import {Main} from "@/components/layout/main.tsx";
import {useParams} from "react-router-dom";
import {useGetRegionName} from "@/lib/geo.ts";
import {TrackedUserAvatar} from "@/components/TrackedUserAvatar.tsx";
import {useUserInfo} from "@/api/analytics/hooks/userGetInfo.ts";
import {generateName} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {UserSidebar} from "@/feature/tracked-user/components/user-sidebar.tsx";
import {UserTopPages} from "@/feature/tracked-user/components/user-top-pages.tsx";
import {useGetSessions} from "@/api/analytics/hooks/useGetTrackingUserSessions.ts";
import {useState} from "react";
import {SessionsList} from "@/feature/tracked-user/components/sessions-list.tsx";

const LIMIT = 25;

function TrackedUser() {
    const {trackedUserId} = useParams();
    const userId = (() => {
        const value = Array.isArray(trackedUserId) ? trackedUserId[0] : trackedUserId;
        if (!value) return "";
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    })();
    const [page, setPage] = useState(1);


    const { data, isLoading } = useUserInfo(1, userId);
    const { data: sessionsData, isLoading: isLoadingSessions } = useGetSessions({
        userId,
        page: page,
        limit: LIMIT + 1,
    });

    const allSessions = sessionsData?.data || [];
    const hasNextPage = allSessions.length > LIMIT;
    const sessions = allSessions.slice(0, LIMIT);
    const hasPrevPage = page > 1;

    const { getRegionName } = useGetRegionName();

    const displayName = generateName(userId);

    return (
        <Main>
            <div className="flex items-center gap-4 mb-4">
                <TrackedUserAvatar userId={userId} size={64} />
                <div className="mt-3 w-full flex gap-2">
                    <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                            {isLoading ? <Skeleton className="h-6 w-32" /> : displayName}
                        </div>
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-1 mt-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        ) : (
                            <p className="text-neutral-400 dark:text-neutral-500 text-xs font-mono mt-1 truncate">{userId}</p>
                        )}
                    </div>
                </div>
                {data?.ip && (
                    <div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                            IP: {data.ip}
                        </Badge>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <UserSidebar
                    data={data}
                    isLoading={isLoading}
                    getRegionName={getRegionName}
                />

                <div className="flex-1 min-w-0 space-y-4">
                    <UserTopPages userId={userId} />
                    <SessionsList
                        sessions={sessions}
                        isLoading={isLoadingSessions}
                        page={page}
                        onPageChange={setPage}
                        hasNextPage={hasNextPage}
                        hasPrevPage={hasPrevPage}
                        userId={userId}
                    />
                </div>
            </div>
        </Main>
    );
}

export default TrackedUser;