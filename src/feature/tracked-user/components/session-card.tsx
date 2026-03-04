import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import {DateTime} from "luxon";
import {GetSessionsResponse} from "@/api/analytics/endpoints/sessions.ts";
import {TrackedUserAvatar} from "@/components/TrackedUserAvatar.tsx";
import {Channel} from "@/components/channel.tsx";
import {cn, formatter, generateName} from "@/lib/utils.ts";
import {formatShortDuration, hour12, userLocale} from "@/lib/dateTimeUtils.ts";
import {CountryFlagTooltipIcon, BrowserTooltipIcon, DeviceTypeTooltipIcon, OperatingSystemTooltipIcon} from "@/components/tooltip-icons.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {EventIcon, PageviewIcon} from "@/components/EventIcons.tsx";
import {Link} from "react-router-dom";
import {truncateString} from "@/api/utils.ts";
import {memo, useState} from "react";
import {SessionDetails} from "@/feature/tracked-user/components/session-details.tsx";

interface SessionCardProps {
    session: GetSessionsResponse[number];
    userId?: string;
    onClick?: () => void;
    expandedByDefault?: boolean;
    highlightedEventTimestamp?: number;
}

export function SessionCard({ session, onClick, userId, expandedByDefault, highlightedEventTimestamp }: SessionCardProps) {
    const [expanded, setExpanded] = useState(expandedByDefault || false);
    // Calculate session duration in minutes
    const start = DateTime.fromSQL(session.sessionStart);
    const end = DateTime.fromSQL(session.sessionEnd);
    const totalSeconds = Math.floor(end.diff(start).milliseconds / 1000);
    const duration = formatShortDuration(totalSeconds);

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            setExpanded(!expanded);
        }
    };

    return (
        <div className="rounded-lg border overflow-hidden">
            <div className="p-3 cursor-pointer" onClick={handleCardClick}>
                {/* Mobile layout - two rows */}
                <div className="flex flex-col gap-2 md:hidden">
                    {/* Top row on mobile - User name (left) + Timestamp (right) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrackedUserAvatar
                                size={24}
                                userId={session.userId}
                            />
                            <span className="text-xs text-neutral-600 dark:text-neutral-200 truncate max-w-[150px]">
                                {generateName(session.sessionId)}
                            </span>
                        </div>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {DateTime.fromSQL(session.sessionStart, {
                              zone: "utc",
                          })
                              .setLocale(userLocale)
                              .toFormat(hour12 ? "MMM d, h:mm a" : "dd MMM, HH:mm")}
                        </span>
                    </div>

                    {/* Bottom row on mobile - Icons, badges, channel */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {session.country && (
                            <CountryFlagTooltipIcon
                                country={session.country}
                                city={session.city}
                                region={session.region}
                            />
                        )}
                        <BrowserTooltipIcon
                            browser={session.browser || "Unknown"}
                            browser_version={session.browserVersion}
                        />
                        <OperatingSystemTooltipIcon
                            operating_system={session.os || ""}
                            operating_system_version={session.osVersion}
                        />
                        <DeviceTypeTooltipIcon
                            device_type={session.device || ""}
                            screen_width={session.screenWidth}
                            screen_height={session.screenHeight}
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                    <PageviewIcon />
                                    <span>{formatter(session.pageviews)}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Pageviews</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                    <EventIcon />
                                    <span>{formatter(session.events + (session.buttonClicks || 0) + (session.copies || 0) + (session.formSubmits || 0) + (session.inputChanges || 0))}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Events</TooltipContent>
                        </Tooltip>
                        <Channel
                            channel={session.channel}
                            referrer={session.referrer}
                        />
                    </div>
                </div>

                {/* Desktop layout - single row */}
                <div className="hidden md:flex items-center gap-2">
                    {!userId && (
                        <Link
                            to={`/dashboard/tracked-users/${encodeURIComponent(
                                session.userId
                            )}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-2"
                        >
                            <TrackedUserAvatar
                                size={24}
                                userId={session.userId}
                            />
                            <span className="text-xs text-neutral-600 dark:text-neutral-200 w-24 truncate hover:underline">
                                {generateName(session.sessionId)}
                              </span>
                        </Link>
                    )}

                    {/* Icons section */}
                    <div className="flex space-x-2 items-center">
                        {session.country && (
                            <CountryFlagTooltipIcon
                                country={session.country}
                                city={session.city}
                                region={session.region}
                            />
                        )}
                        <BrowserTooltipIcon
                            browser={session.browser || "Unknown"}
                            browser_version={session.browserVersion}
                        />
                        <OperatingSystemTooltipIcon
                            operating_system={session.os || ""}
                            operating_system_version={session.osVersion}
                        />
                        <DeviceTypeTooltipIcon
                            device_type={session.device || ""}
                            screen_width={session.screenWidth}
                            screen_height={session.screenHeight}
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                    <PageviewIcon />
                                    <span>{formatter(session.pageviews)}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Pageviews</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                    <EventIcon />
                                    <span>{formatter(session.events + (session.buttonClicks || 0) + (session.copies || 0) + (session.formSubmits || 0) + (session.inputChanges || 0))}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Events</TooltipContent>
                        </Tooltip>
                        <Channel
                            channel={session.channel}
                            referrer={session.referrer}
                        />
                    </div>

                    {/* Pages section with tooltips for long paths */}
                    <div className="items-center ml-3 flex-1 min-w-0 flex">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] inline-block cursor-pointer hover:opacity-70"
                                >
                                  {truncateString(session.entryPage, 32)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{session.entryPage || "-"}</p>
                            </TooltipContent>
                        </Tooltip>

                        <ArrowRight className="mx-2 w-3 h-3 shrink-0 text-neutral-500 dark:text-neutral-400" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span
                                    className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] inline-block cursor-pointer hover:opacity-70"
                                >
                                  {truncateString(session.exitPage, 32)}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{session.exitPage || "-"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Time information */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {DateTime.fromSQL(session.sessionStart, {
                              zone: "utc",
                          })
                              .setLocale(userLocale)
                              .toFormat(hour12 ? "MMM d, h:mm a" : "dd MMM, HH:mm")}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-400">•</span>
                        <span>{duration}</span>
                    </div>

                    {/* Expand/Collapse icon */}
                    <div className="ml-2 shrink-0">
                        {expanded ? (
                            <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" strokeWidth={3} />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-400" strokeWidth={3} />
                        )}
                    </div>
                </div>
            </div>

            {expanded && <SessionDetails session={session} userId={userId} highlightedEventTimestamp={highlightedEventTimestamp} />}

        </div>
    );
}

export const SessionCardSkeleton = memo(({ userId, count }: { userId?: string; count?: number }) => {
    // Function to get a random width class for skeletons
    const getRandomWidth = () => {
        const widths = ["w-16", "w-20", "w-24", "w-28", "w-32", "w-36", "w-40", "w-44", "w-48"];
        return widths[Math.floor(Math.random() * widths.length)];
    };

    // Get random width for time displays
    const getRandomTimeWidth = () => {
        const widths = ["w-20", "w-24", "w-28", "w-32"];
        return widths[Math.floor(Math.random() * widths.length)];
    };

    // Get random width for duration displays
    const getRandomDurationWidth = () => {
        const widths = ["w-10", "w-12", "w-14"];
        return widths[Math.floor(Math.random() * widths.length)];
    };

    // Create multiple skeletons for a realistic loading state
    const skeletons = Array.from({ length: count || 25 }).map((_, index) => (
        <div
            className="rounded-lg  overflow-hidden"
            key={index}
        >
            <div className="p-3">
                {/* Mobile layout - two rows */}
                <div className="flex flex-col gap-2 md:hidden">
                    {/* Top row - Avatar + name (left) + timestamp (right) */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className={cn("h-3", getRandomTimeWidth())} />
                    </div>

                    {/* Bottom row - Icons, badges, channel */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-[21px] w-12 rounded-sm" />
                        <Skeleton className="h-[21px] w-12 rounded-sm" />
                        <Skeleton className="h-[21px] w-16 rounded-sm" />
                    </div>
                </div>

                {/* Desktop layout - single row */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Avatar and User ID */}
                    {!userId && (
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    )}

                    {/* Icons section - matching actual component structure */}
                    <div className="flex space-x-2 items-center">
                        {/* Country, Browser, OS, Device icons */}
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        {/* Pageviews badge */}
                        <Skeleton className="h-[21px] w-12 rounded-sm" />
                        {/* Events badge */}
                        <Skeleton className="h-[21px] w-12 rounded-sm" />
                        {/* Channel badge */}
                        <Skeleton className="h-[21px] w-16 rounded-sm" />
                    </div>

                    {/* Entry/Exit paths with randomized widths */}
                    <div className="items-center ml-3 flex-1 min-w-0 flex">
                        <Skeleton className={cn("h-3 max-w-[200px]", getRandomWidth())} />
                        <ArrowRight className="mx-2 w-3 h-3 shrink-0 text-neutral-500 dark:text-neutral-400 opacity-20" />
                        <Skeleton className={cn("h-3 max-w-[200px]", getRandomWidth())} />
                    </div>

                    {/* Time information */}
                    <div className="flex items-center gap-1.5">
                        <Skeleton className={cn("h-3", getRandomTimeWidth())} />
                        <span className="text-neutral-500 dark:text-neutral-400 opacity-20">•</span>
                        <Skeleton className={cn("h-3", getRandomDurationWidth())} />
                    </div>

                    {/* Expand icon */}
                    <div className="ml-2 shrink-0">
                        <Skeleton className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </div>
    ));

    return <>{skeletons}</>;
});
