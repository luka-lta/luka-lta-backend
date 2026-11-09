import { RevenueFinanceCard } from "@/feature/dashboard/business/RevenueFinanceCard.tsx";
import { AppStoreMetricsCard } from "@/feature/dashboard/business/AppStoreMetricsCard.tsx";
import { TrackspireKpisCard } from "@/feature/dashboard/business/TrackspireKpisCard.tsx";
import { BusinessKpis } from "@/feature/dashboard/business/BusinessKpis.tsx";

export function BusinessTab() {
    return (
        <div className="space-y-4">
            <BusinessKpis />
            <RevenueFinanceCard />
            <div className="grid gap-4 lg:grid-cols-2">
                <AppStoreMetricsCard />
                <TrackspireKpisCard />
            </div>
        </div>
    );
}
