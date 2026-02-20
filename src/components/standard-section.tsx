import {ReactNode} from 'react';
import {MetricResponse} from "@/api/analytics/endpoints/overview.ts";
import {usePaginatedMetric} from "@/api/analytics/hooks/useGetMetric.ts";
import { ScrollArea } from "./ui/scroll-area";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Info, Link} from "lucide-react";
import {Row} from "@/components/Row.tsx";
import {ErrorState} from "@/components/error-state.tsx";
import {StandardSkeleton} from "@/components/standard-skeleton.tsx";

interface StandardSectionProps {
    title: string,
    getKey: (item: MetricResponse) => string;
    getLabel: (item: MetricResponse) => ReactNode;
    getValue: (item: MetricResponse) => string;
    getFilterLabel?: (item: MetricResponse) => string;
    getLink?: (item: MetricResponse) => string;
    countLabel?: string;
    filterParameter: string;
    expanded: boolean;
    close: () => void;
    hasSubrow?: boolean;
    getSubrowLabel?: (item: MetricResponse) => ReactNode;
}

function StandardSection({
    title,
    getKey,
    getLabel,
    getValue,
    getLink,
    countLabel,
    filterParameter,
}: StandardSectionProps) {
    const { data, isLoading, isFetching, error, refetch } = usePaginatedMetric({
        parameter: filterParameter,
        limit: 100,
        page: 1,
    });

    const itemsForDisplay = data?.data;

    const ratio = itemsForDisplay?.[0]?.percentage ? 100 / itemsForDisplay[0].percentage : 1;

    return (
        <>
            {isFetching && (
                <div className="absolute top-[-8px] left-0 w-full h-full">
                    <h1>Loading</h1>
                </div>
            )}
            <div className="flex flex-row gap-2 justify-between pr-1 text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                <div className="flex flex-row gap-1 items-center">
                    {title}
                    {["Countries", "Regions", "Cities"].includes(title) && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Geolocation by{" "}
                                <Link href="https://ipapi.is/" target="_blank" className="text-emerald-400 hover:text-emerald-300">
                                    ipapi.is
                                </Link>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div>{countLabel || "Sessions"}</div>
            </div>
            <ScrollArea className="h-[314px]">
                <div className="flex flex-col gap-2 overflow-x-hidden">
                    {isLoading ? (
                        <StandardSkeleton />
                    ) : error ? (
                        <ErrorState title="Failed to load data" message={error.message} refetch={refetch} />
                    ) : (
                        <>
                            {itemsForDisplay?.length ? (
                                itemsForDisplay
                                    // .slice(0, MAX_ITEMS_TO_DISPLAY)
                                    .map(e => (
                                        <Row
                                            key={getKey(e)}
                                            e={e}
                                            ratio={ratio}
                                            getKey={getKey}
                                            getLabel={getLabel}
                                            getValue={getValue}
                                            getLink={getLink}
                                        />
                                    ))
                            ) : (
                                <div className="text-neutral-600 dark:text-neutral-300 w-full text-center mt-6 flex flex-row gap-2 items-center justify-center">
                                    <Info className="w-5 h-5" />
                                    No Data
                                </div>
                            )}
                        </>
                    )}
{/*                    {!isLoading && !error && itemsForDisplay?.length ? (
                        <div className="flex flex-row gap-2 justify-between items-center">
                            <StandardSectionDialog
                                title={title}
                                ratio={ratio}
                                getKey={getKey}
                                getLabel={getLabel}
                                getValue={getValue}
                                getFilterLabel={getFilterLabel}
                                getLink={getLink}
                                countLabel={countLabel}
                                filterParameter={filterParameter}
                                expanded={expanded}
                                close={close}
                            />
                        </div>
                    ) : null}*/}
                </div>
            </ScrollArea>
        </>
    );
}

export default StandardSection;