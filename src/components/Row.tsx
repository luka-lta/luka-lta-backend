
import { SquareArrowOutUpRight } from "lucide-react";
import { ReactNode } from "react";
import { round } from "lodash";
import {MetricResponse} from "@/api/analytics/endpoints/overview.ts";
import NumberFlow from "@number-flow/react";

// Shared row item component
const RowItem = ({
                     item,
                     ratio,
                     getKey,
                     getLabel,
                     getLink,
                     leftContent,
                 }: {
    item: MetricResponse;
    ratio: number;
    getKey: (item: MetricResponse) => string;
    getLabel: (item: MetricResponse) => ReactNode;
    getValue: (item: MetricResponse) => string;
    getLink?: (item: MetricResponse) => string;
    leftContent?: ReactNode;
}) => {
    return (
        <div
            key={getKey(item)}
            className="relative h-6 flex items-center cursor-pointer hover:bg-neutral-150/50 dark:hover:bg-neutral-850 group"
        >
            <div
                className="absolute inset-0 bg-dataviz py-2 opacity-25 rounded-md"
                style={{ width: `${item.percentage * ratio}%` }}
            ></div>
            <div className="z-10 mx-2 flex justify-between items-center text-xs w-full gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    {leftContent}
                    <span className="truncate">{getLabel(item)}</span>
                    {getLink && (
                        <a href={getLink(item)} rel="noopener noreferrer" target="_blank" onClick={e => e.stopPropagation()} className="shrink-0">
                            <SquareArrowOutUpRight
                                className="ml-0.5 w-3.5 h-3.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                                strokeWidth={3}
                            />
                        </a>
                    )}
                </div>
                <div className="text-xs flex gap-2 shrink-0">
                    <div className="hidden group-hover:block text-neutral-600 dark:text-neutral-400">
                        {round(item.percentage, 1)}%
                    </div>
                    <NumberFlow respectMotionPreference={false} value={item.count} format={{ notation: "compact" }} />
                </div>
            </div>
        </div>
    );
};

export const Row = ({
                        e,
                        ratio,
                        getKey,
                        getLabel,
                        getValue,
                        getLink,
                    }: {
    e: MetricResponse;
    ratio: number;
    getKey: (item: MetricResponse) => string;
    getLabel: (item: MetricResponse) => ReactNode;
    getValue: (item: MetricResponse) => string;
    getLink?: (item: MetricResponse) => string;
}) => {
    return (
        <div className="flex flex-col">
            <RowItem
                item={e}
                ratio={ratio}
                getKey={getKey}
                getLabel={getLabel}
                getValue={getValue}
                getLink={getLink}
            />
        </div>
    );
};
