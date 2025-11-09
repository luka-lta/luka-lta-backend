import {Progress} from "@/components/ui/progress"
import {OperatingSystem} from "@/components/operating-system.tsx";
import {useStatistics} from "@/feature/dashboard/hooks/useStatistics.ts";
import {Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {AlertTriangle, Loader2} from "lucide-react";
import {osStatType} from "@/feature/dashboard/schema/statistic-schema.ts";

function OsUsage() {
    const [osStats] = useStatistics('os');

    if (osStats.error) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <AlertTriangle />
                    </EmptyMedia>
                    <EmptyTitle>An error occurred</EmptyTitle>
                    <EmptyDescription>{osStats.error.message}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    if (osStats.isLoading) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Loader2 className="animate-spin" />
                    </EmptyMedia>
                    <EmptyTitle>Loading OS statistics</EmptyTitle>
                    <EmptyDescription>Please wait a moment</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="space-y-2.5">
            {(osStats.data?.statistics as osStatType[]).map((operationSystem) => (
                <div key={operationSystem.os} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <OperatingSystem os={operationSystem.os}/>
                            <span className="text-sm font-medium">{operationSystem.os}</span>
                        </div>

                        <span className="text-sm font-semibold tabular-nums">
                          {operationSystem.amount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Progress value={operationSystem.percentage}/>
                        <span className="text-muted-foreground text-xs font-medium tabular-nums">
                          {operationSystem.percentage}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default OsUsage
