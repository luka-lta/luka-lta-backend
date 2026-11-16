import { useMemo } from "react";
import { useClicks } from "@/api/dashboard/hooks.ts";
import AnalyticsItem from "@/feature/clicks/components/AnalyticsItem.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { StatCard } from "@/components/data/stat-card.tsx";

/** Kennzahlen und Verlauf der letzten ~90 Tage. */
export function ClicksAnalyticsSummary() {
    const [clicks] = useClicks();

    const kpis = useMemo(() => {
        const data = clicks.data?.clicks ?? [];
        const totalClicks = data.reduce((sum, click) => sum + click.total_clicks, 0);
        const trackedLinks = new Set(data.map((click) => click.displayname)).size;
        const trackedDays = new Set(data.map((click) => click.click_date)).size;
        return { totalClicks, trackedLinks, avgPerDay: trackedDays > 0 ? Math.round(totalClicks / trackedDays) : 0 };
    }, [clicks.data]);

    if (clicks.error) {
        return <ErrorState title="Auswertung konnte nicht geladen werden" error={clicks.error} onRetry={() => clicks.refetch()} />;
    }

    const value = (n: number) => (clicks.isPending ? undefined : n);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Klicks gesamt" value={value(kpis.totalClicks)} hint="Letzte 90 Tage" />
                <StatCard label="Links mit Klicks" value={value(kpis.trackedLinks)} />
                <StatCard label="Ø Klicks pro Tag" value={value(kpis.avgPerDay)} hint="An Tagen mit Klicks" />
            </div>
            <AnalyticsItem clicks={clicks.data?.clicks ?? []} loading={clicks.isPending} />
        </div>
    );
}
