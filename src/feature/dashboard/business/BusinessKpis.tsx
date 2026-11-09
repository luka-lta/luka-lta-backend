import { FileWarning, Smartphone, TrendingUp, Wallet } from "lucide-react";
import { StatCard, StatGrid } from "@/components/data/stat-card.tsx";
import { useAppList } from "@/api/apps/hooks.ts";
import { openInvoices, totalOpenInvoiceAmount, totalRevenueThisMonth } from "@/feature/dashboard/business/demoData.ts";

const euro = (value: number) => `${value.toLocaleString("de-DE")} €`;

/** Alle Werte stammen aus Demo-Daten bzw. der Mock-App-Registry und sind entsprechend markiert. */
export function BusinessKpis() {
    const appList = useAppList();
    const apps = appList.data;

    const appStoreRevenue = apps
        ? apps.filter((app) => app.category === "app-store").reduce((sum, app) => sum + (app.metrics?.revenue ?? 0), 0)
        : undefined;
    const trackspireApp = apps?.find((app) => app.category === "saas");
    const trackspireMrr = apps ? (trackspireApp?.metrics?.mrr ?? 0) : undefined;

    return (
        <StatGrid>
            <StatCard label="Umsatz diesen Monat" value={totalRevenueThisMonth()} format={euro} icon={Wallet} demo />
            <StatCard label="Trackspire MRR" value={trackspireMrr} format={euro} icon={TrendingUp} href="/dashboard/apps" demo />
            <StatCard label="App-Store-Umsatz" value={appStoreRevenue} format={euro} icon={Smartphone} href="/dashboard/apps" demo />
            <StatCard
                label="Offene Rechnungen"
                value={totalOpenInvoiceAmount()}
                format={euro}
                icon={FileWarning}
                hint={`${openInvoices.length} ${openInvoices.length === 1 ? "Rechnung" : "Rechnungen"}`}
                tone={openInvoices.length > 0 ? "warning" : "default"}
                demo
            />
        </StatGrid>
    );
}
