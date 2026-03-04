import {UserInfo} from "@/api/analytics/endpoints/trackedUsers.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Calendar, CalendarCheck, Clock, Files} from "lucide-react";
import {EventIcon, PageviewIcon} from "@/components/EventIcons.tsx";
import {formatDuration} from "@/lib/dateTimeUtils.ts";
import {DateTime} from "luxon";
import Flag from "react-flagkit";
import {getCountryName, getLanguageName} from "@/api/utils.ts";
import {DeviceIcon} from "@/components/device-icon.tsx";
import {Browser} from "@/components/browser.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";

interface UserSidebarProps {
    data: UserInfo | undefined;
    isLoading: boolean;
    getRegionName: (region: string) => string;
}

function SidebarCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-lg border  p-4 ${className}`}
        >
            {children}
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850 last:border-0 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
            <span className="text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5">
        {icon}
                {value}
      </span>
        </div>
    );
}

function StatCard({
                      icon,
                      label,
                      value,
                      isLoading,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-0.5">
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 uppercase tracking-wide">
                    <Skeleton className="w-3 h-3 rounded" />
                    <Skeleton className="h-2.5 w-14 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 uppercase tracking-wide">
                {icon}
                {label}
            </div>
            <div className="text-sm">{value}</div>
        </div>
    );
}

export function UserSidebar({ data, isLoading, getRegionName }: UserSidebarProps) {
    return (
        <div className="w-full lg:w-[300px] md:shrink-0 space-y-3">
            <SidebarCard>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={<Files className="w-3 h-3" />}
                        label="Sessions"
                        value={data?.sessions ?? "—"}
                        isLoading={isLoading}
                    />
                    <StatCard
                        icon={<PageviewIcon className="w-3 h-3" />}
                        label="Pageviews"
                        value={data?.pageviews ?? "—"}
                        isLoading={isLoading}
                    />
                    <StatCard
                        icon={<EventIcon className="w-3 h-3" />}
                        label="Events"
                        value={data?.events ?? "—"}
                        isLoading={isLoading}
                    />
                    <StatCard
                        icon={<Clock className="w-3 h-3" />}
                        label="Avg Duration"
                        value={data?.duration ? formatDuration(data.duration) : "—"}
                        isLoading={isLoading}
                    />
                    <StatCard
                        icon={<Calendar className="w-3 h-3" />}
                        label="First Seen"
                        value={
                            data?.firstSeen
                                ? DateTime.fromSQL(data.firstSeen, { zone: "utc" }).setZone('Europe/Berlin').toLocaleString(DateTime.DATE_MED)
                                : "—"
                        }
                        isLoading={isLoading}
                    />
                    <StatCard
                        icon={<CalendarCheck className="w-3 h-3" />}
                        label="Last Seen"
                        value={
                            data?.lastSeen
                                ? DateTime.fromSQL(data.lastSeen, { zone: "utc" }).setZone('Europe/Berlin').toLocaleString(DateTime.DATE_MED)
                                : "—"
                        }
                        isLoading={isLoading}
                    />
                </div>
            </SidebarCard>

            {/* Location & Device Info */}
            <SidebarCard>
                <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                    Location & Device
                </h3>
                {isLoading ? (
                    <div className="space-y-0">
                        {/* Country */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-14 rounded" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-3 w-24 rounded" />
                            </div>
                        </div>
                        {/* Region */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-12 rounded" />
                            <Skeleton className="h-3 w-32 rounded" />
                        </div>
                        {/* Language */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-16 rounded" />
                            <Skeleton className="h-3 w-20 rounded" />
                        </div>
                        {/* Device */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-12 rounded" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-3 w-14 rounded" />
                            </div>
                        </div>
                        {/* Browser */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-14 rounded" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-3 w-20 rounded" />
                            </div>
                        </div>
                        {/* OS */}
                        <div className="flex items-center justify-between py-1.5 border-b border-neutral-50 dark:border-neutral-850">
                            <Skeleton className="h-3 w-8 rounded" />
                            <div className="flex items-center gap-1.5">
                                <Skeleton className="w-4 h-4 rounded" />
                                <Skeleton className="h-3 w-24 rounded" />
                            </div>
                        </div>
                        {/* Screen */}
                        <div className="flex items-center justify-between py-1.5">
                            <Skeleton className="h-3 w-12 rounded" />
                            <Skeleton className="h-3 w-16 rounded" />
                        </div>
                    </div>
                ) : (
                    <div>
                        <InfoRow
                            icon={<Flag country={data?.country || ""} className="w-4 h-4" />}
                            label="Country"
                            value={data?.country ? getCountryName(data.country) : "—"}
                        />
                        <InfoRow
                            label="Region"
                            value={
                                <span className="truncate max-w-[160px] inline-block">
                  {data?.region ? getRegionName(data.region) : "—"}
                                    {data?.city && `, ${data.city}`}
                </span>
                            }
                        />
                        <InfoRow label="Language" value={data?.language ? getLanguageName(data.language) : "—"} />
                        <InfoRow
                            icon={
                                <DeviceIcon deviceType={data?.device || ""} size={13} />
                            }
                            label="Device"
                            value={data?.device ?? "—"}
                        />
                        <InfoRow
                            icon={<Browser browser={data?.browser || "Unknown"} size={13} />}
                            label="Browser"
                            value={data?.browser ? `${data.browser}${data.browserVersion ? ` v${data.browserVersion}` : ""}` : "—"}
                        />
                        <InfoRow
                            icon={<OperatingSystem os={data?.os || ""} size={13} />}
                            label="OS"
                            value={
                                data?.os
                                    ? `${data.os}${data.osVersion ? ` v${data.os}` : ""}`
                                    : "—"
                            }
                        />
                        <InfoRow
                            label="Screen"
                            value={data?.screenWidth && data?.screenHeight ? `${data.screenWidth}×${data.screenHeight}` : "—"}
                        />
                    </div>
                )}
            </SidebarCard>
        </div>
    )
}