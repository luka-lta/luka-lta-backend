import { KpiCard } from "@/components/KpiCard.tsx";
import { Wallet, TrendingUp, Smartphone, FileWarning } from "lucide-react";
import { useAppList } from "@/api/apps/hooks.ts";
import { totalRevenueThisMonth, totalOpenInvoiceAmount } from "@/feature/dashboard/business/demoData.ts";

const euroFormatter = (value: number) => `${value.toLocaleString("de-DE")} €`;

export function BusinessKpis() {
    const appList = useAppList();
    const apps = appList.data;

    const appStoreRevenue = apps
        ? apps.filter((app) => app.category === "app-store").reduce((sum, app) => sum + (app.metrics?.revenue ?? 0), 0)
        : undefined;

    const trackspireApp = apps?.find((app) => app.category === "saas");
    const trackspireMrr = apps ? (trackspireApp?.metrics?.mrr ?? 0) : undefined;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Umsatz diesen Monat"
                value={totalRevenueThisMonth()}
                valueFormatter={euroFormatter}
                icon={Wallet}
                iconBg="bg-emerald-100 dark:bg-emerald-500/10"
                iconColor="text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
                title="Trackspire MRR"
                value={trackspireMrr}
                valueFormatter={euroFormatter}
                icon={TrendingUp}
                iconBg="bg-violet-100 dark:bg-violet-500/10"
                iconColor="text-violet-600 dark:text-violet-400"
            />
            <KpiCard
                title="App Store Revenue"
                value={appStoreRevenue}
                valueFormatter={euroFormatter}
                icon={Smartphone}
                iconBg="bg-sky-100 dark:bg-sky-500/10"
                iconColor="text-sky-600 dark:text-sky-400"
            />
            <KpiCard
                title="Offene Rechnungen"
                value={totalOpenInvoiceAmount()}
                valueFormatter={euroFormatter}
                icon={FileWarning}
                iconBg="bg-amber-100 dark:bg-amber-500/10"
                iconColor="text-amber-600 dark:text-amber-400"
            />
        </div>
    );
}
