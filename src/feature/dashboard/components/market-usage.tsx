import {Progress} from "@/components/ui/progress"
import Flag from "react-flagkit";
import {useStatistics} from "@/feature/dashboard/hooks/useStatistics.ts";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {AlertTriangle, Loader2} from "lucide-react";
import {marketStatType} from "@/feature/dashboard/schema/statistic-schema.ts";

function MarketUsage() {
    const [marketStats] = useStatistics('market');

    if (marketStats.error) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <AlertTriangle />
                    </EmptyMedia>
                    <EmptyTitle>An error occurred</EmptyTitle>
                    <EmptyDescription>{marketStats.error.message}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    if (marketStats.isLoading) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Loader2 className="animate-spin" />
                    </EmptyMedia>
                    <EmptyTitle>Loading Market statistics</EmptyTitle>
                    <EmptyDescription>Please wait a moment</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-2.5">
            {(marketStats.data?.statistics as marketStatType[]).map((market) => (
                <div key={market.market} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Flag className='w-4 h-4' country={market.market}/>
                            <span className="text-sm font-medium">{market.market}</span>
                        </div>

                        <span className="text-sm font-semibold tabular-nums">
                          {market.amount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Progress value={market.percentage}/>
                        <span className="text-muted-foreground text-xs font-medium tabular-nums">
                          {market.percentage}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MarketUsage
