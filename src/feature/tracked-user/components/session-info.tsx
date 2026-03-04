import {useGetRegionName} from "@/lib/geo.ts";
import {TrackedUserAvatar} from "@/components/TrackedUserAvatar.tsx";
import {generateName} from "@/lib/utils.ts";
import {CopyText} from "@/components/copy-text.tsx";
import {getCountryName, getLanguageName} from "@/api/utils.ts";
import Flag from "react-flagkit";
import {DeviceIcon} from "@/components/device-icon.tsx";
import {Browser} from "@/components/browser.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";

interface SessionInfoTabProps {
/*    session: GetSessionsResponse[number];*/
    sessionDetails: {
        userId?: string;
        language?: string;
        country?: string;
        region?: string;
        city?: string;
        device?: string;
        browser?: string;
        browserVersion?: string;
        os?: string;
        osVersion?: string;
        screenWidth?: number;
        screenHeight?: number;
        ip?: string;
        channel?: string;
        referrer?: string;
        entryPage?: string;
    };
}

export function SessionInfoTab({
   sessionDetails,
}: SessionInfoTabProps) {
    const { getRegionName } = useGetRegionName();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[auto_auto_auto] gap-8 mb-6">
            {/* User Information */}
            <div>
                <h4 className="text-sm font-medium mb-3 text-neutral-600 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    User Information
                </h4>
                <div className="space-y-3">
                    {sessionDetails?.userId && (
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center shrink-0">
                                <TrackedUserAvatar
                                    size={40}
                                    userId={sessionDetails.userId}
                                />
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                                    {generateName(sessionDetails.userId)}
                                  </span>
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center">
                                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                                       User ID:
                                    </span>
                                    <CopyText
                                        text={sessionDetails.userId}
                                        maxLength={24}
                                        className="inline-flex ml-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {sessionDetails?.language && (
                            <div className="text-sm flex items-center gap-2">
                                <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                                  Language:
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {sessionDetails.language
                                      ? getLanguageName(sessionDetails.language)
                                      : "N/A"}
                                </span>
                            </div>
                        )}

                        {sessionDetails?.country && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                                  Country:
                                </span>
                                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                                    <Flag country={sessionDetails.country} />
                                    <span>{getCountryName(sessionDetails.country)}</span>
                                    {sessionDetails.region && (
                                        <span>({sessionDetails.region})</span>
                                    )}
                                </div>
                            </div>
                        )}
                        {sessionDetails?.region &&
                            getRegionName(sessionDetails.region) && (
                                <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                                        Region:
                                      </span>
                                      <span className="text-neutral-500 dark:text-neutral-400">
                                        {getRegionName(sessionDetails.region)}
                                      </span>
                                </div>
                            )}
                        {sessionDetails?.city && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                                  City:
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {sessionDetails.city}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Device Information */}
            <div>
                <h4 className="text-sm font-medium mb-3 text-neutral-600 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    Device Information
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          Device:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <DeviceIcon deviceType={sessionDetails?.device || ""} />
                            <span>{sessionDetails?.device || "Unknown"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          Browser:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <Browser
                                browser={sessionDetails?.browser || "Unknown"}
                            />
                            <span>
                                {sessionDetails?.browser || "Unknown"}
                                                {sessionDetails?.browserVersion && (
                                                    <span className="ml-1">
                                    v{sessionDetails.browserVersion}
                            </span>
                                )}
                          </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          OS:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <OperatingSystem
                                os={sessionDetails?.os || ""}
                            />
                            <span>
                                {sessionDetails?.os || "Unknown"}
                                                {sessionDetails?.osVersion && (
                                                    <span className="ml-1">
                                    {sessionDetails.osVersion}
                            </span>
                                )}
                          </span>
                        </div>
                    </div>

                    {sessionDetails?.screenWidth &&
                    sessionDetails?.screenHeight ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                            Screen:
                          </span>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                {sessionDetails.screenWidth} ×{" "}
                                                {sessionDetails.screenHeight}
                            </span>
                        </div>
                    ) : null}
                    {sessionDetails?.ip && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                            IP:
                          </span>
                            <span className="text-neutral-500 dark:text-neutral-400">
                                {sessionDetails.ip}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Source Information */}
            <div>
                <h4 className="text-sm font-medium mb-3 text-neutral-600 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                    Source Information
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          Channel:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <span>{sessionDetails?.channel || "None"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          Referrer:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <span>{sessionDetails?.referrer || "None"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300 min-w-[80px]">
                          Entry Page:
                        </span>
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                            <span>{sessionDetails?.entryPage || "None"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
