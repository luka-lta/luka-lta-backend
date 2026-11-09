import { FileWarning, MousePointerClick, TrendingUp, Wallet } from "lucide-react";
import { StatCard, StatGrid, type StatTrend } from "@/components/data/stat-card.tsx";
import { useAppList } from "@/api/apps/hooks.ts";
import { totalOpenInvoiceAmount, totalRevenueThisMonth } from "@/feature/dashboard/business/demoData.ts";
import type { ClicksMonthlyTypeSchema } from "@/feature/dashboard/schema/ClickSummarySchema.ts";

const euro = (value: number) => `${value.toLocaleString("de-DE")} €`;

interface QuickStatsProps {
    totalClicks: number | undefined;
    clicksMonthly: ClicksMonthlyTypeSchema[] | undefined;
}

function monthOverMonthTrend(clicksMonthly: ClicksMonthlyTypeSchema[] | undefined): StatTrend | undefined {
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

    return { value: Math.round(((current - previous) / previous) * 100), label: "zum Vormonat" };
}

/** Klicks sind echte Daten; Umsatz, MRR und Rechnungen stammen aus Demo-Daten und sind markiert. */
export function QuickStats({ totalClicks, clicksMonthly }: QuickStatsProps) {
    const appList = useAppList();
    const apps = appList.data;
    const trackspireApp = apps?.find((app) => app.category === "saas");
    const trackspireMrr = apps ? (trackspireApp?.metrics?.mrr ?? 0) : undefined;

    return (
        <StatGrid>
            <StatCard
                label="Klicks gesamt"
                value={totalClicks}
                icon={MousePointerClick}
                trend={monthOverMonthTrend(clicksMonthly)}
                href="/dashboard/clicks"
            />
            <StatCard label="Umsatz diesen Monat" value={totalRevenueThisMonth()} format={euro} icon={Wallet} href="/dashboard/business" demo />
            <StatCard label="Trackspire MRR" value={trackspireMrr} format={euro} icon={TrendingUp} href="/dashboard/business" demo />
            <StatCard label="Offene Rechnungen" value={totalOpenInvoiceAmount()} format={euro} icon={FileWarning} href="/dashboard/business" demo />
        </StatGrid>
    );
}
