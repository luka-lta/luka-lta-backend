import { KpiCard } from "@/components/KpiCard.tsx";
import { TrendingDown, TrendingUp, MousePointerClick, Wallet, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useAppList } from "@/api/apps/hooks.ts";
import { totalRevenueThisMonth, totalOpenInvoiceAmount } from "@/feature/dashboard/business/demoData.ts";
import type { ClicksMonthlyTypeSchema } from "@/feature/dashboard/schema/ClickSummarySchema.ts";

const euroFormatter = (value: number) => `${value.toLocaleString("de-DE")} €`;

interface QuickStatsProps {
    totalClicks: number | undefined;
    clicksMonthly: ClicksMonthlyTypeSchema[] | undefined;
}

function monthOverMonthTrend(clicksMonthly: ClicksMonthlyTypeSchema[] | undefined): React.ReactNode | undefined {
    if (!clicksMonthly || clicksMonthly.length === 0) return undefined;

    const totalsByMonth = new Map<string, number>();
    for (const entry of clicksMonthly) {
        totalsByMonth.set(entry.month, (totalsByMonth.get(entry.month) ?? 0) + entry.total_clicks);
    }

    const months = Array.from(totalsByMonth.keys()).sort();
    if (months.length < 2) return undefined;

    const current = totalsByMonth.get(months[months.length - 1]) ?? 0;
    const previous = totalsByMonth.get(months[months.length - 2]) ?? 0;
    if (previous === 0) return undefined;

    const changePercent = Math.round(((current - previous) / previous) * 100);
    const isPositive = changePercent >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <p className={cn("text-xs flex items-center gap-1", isPositive ? "text-emerald-500" : "text-rose-500")}>
            <Icon className="w-3 h-3" />
            {isPositive ? "+" : ""}
            {changePercent}% vs last month
        </p>
    );
}

export function QuickStats({ totalClicks, clicksMonthly }: QuickStatsProps) {
    const appList = useAppList();
    const apps = appList.data;
    const trackspireApp = apps?.find((app) => app.category === "saas");
    const trackspireMrr = apps ? (trackspireApp?.metrics?.mrr ?? 0) : undefined;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Trackspire MRR"
                value={trackspireMrr}
                valueFormatter={euroFormatter}
                icon={TrendingUp}
                iconBg="bg-violet-100 dark:bg-violet-500/10"
                iconColor="text-violet-600 dark:text-violet-400"
                href="/dashboard/business"
            />
            <KpiCard
                title="Umsatz diesen Monat"
                value={totalRevenueThisMonth()}
                valueFormatter={euroFormatter}
                icon={Wallet}
                iconBg="bg-emerald-100 dark:bg-emerald-500/10"
                iconColor="text-emerald-600 dark:text-emerald-400"
                href="/dashboard/business"
            />
            <KpiCard
                title="Total Clicks"
                value={totalClicks}
                icon={MousePointerClick}
                iconBg="bg-sky-100 dark:bg-sky-500/10"
                iconColor="text-sky-600 dark:text-sky-400"
                subtitle={monthOverMonthTrend(clicksMonthly)}
                href="/dashboard/clicks"
            />
            <KpiCard
                title="Offene Rechnungen"
                value={totalOpenInvoiceAmount()}
                valueFormatter={euroFormatter}
                icon={FileWarning}
                iconBg="bg-amber-100 dark:bg-amber-500/10"
                iconColor="text-amber-600 dark:text-amber-400"
                href="/dashboard/business"
            />
        </div>
    );
}
