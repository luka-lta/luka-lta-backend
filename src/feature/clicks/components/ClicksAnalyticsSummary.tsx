import { useMemo } from "react";
import { useClicks } from "@/api/dashboard/hooks.ts";
import AnalyticsItem from "@/feature/clicks/components/AnalyticsItem.tsx";
import { ErrorState } from "@/components/error-state.tsx";
import { KpiCard } from "@/components/KpiCard.tsx";
import { ListTree, MousePointerClick, TrendingUp } from "lucide-react";

export function ClicksAnalyticsSummary() {
    const [clicks, setFilterData] = useClicks();

    const kpis = useMemo(() => {
        const data = clicks.data?.clicks ?? [];
        const totalClicks = data.reduce((sum, click) => sum + click.total_clicks, 0);
        const trackedLinks = new Set(data.map((click) => click.displayname)).size;
        const trackedDays = new Set(data.map((click) => click.click_date)).size;
        return { totalClicks, trackedLinks, avgPerDay: trackedDays > 0 ? Math.round(totalClicks / trackedDays) : 0 };
    }, [clicks.data]);

    if (clicks.error) {
        return (
            <ErrorState
                title="Failed to load analytics"
                message={clicks.error.message}
                refetch={clicks.refetch}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
                <KpiCard
                    title="Total Clicks"
                    value={clicks.isPending ? undefined : kpis.totalClicks}
                    icon={MousePointerClick}
                    iconBg="bg-violet-100 dark:bg-violet-500/10"
                    iconColor="text-violet-600 dark:text-violet-400"
                />
                <KpiCard
                    title="Tracked Links"
                    value={clicks.isPending ? undefined : kpis.trackedLinks}
                    icon={ListTree}
                    iconBg="bg-sky-100 dark:bg-sky-500/10"
                    iconColor="text-sky-600 dark:text-sky-400"
                />
                <KpiCard
                    title="Avg. Clicks / Day"
                    value={clicks.isPending ? undefined : kpis.avgPerDay}
                    icon={TrendingUp}
                    iconBg="bg-emerald-100 dark:bg-emerald-500/10"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                />
            </div>

            <AnalyticsItem
                clicks={clicks.data?.clicks ?? []}
                loading={clicks.isPending}
                setFilterData={setFilterData}
            />
        </div>
    );
}
