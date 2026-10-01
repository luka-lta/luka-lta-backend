import { RevenueFinanceCard } from "@/feature/dashboard/business/RevenueFinanceCard.tsx";
import { AppStoreMetricsCard } from "@/feature/dashboard/business/AppStoreMetricsCard.tsx";
import { TrackspireKpisCard } from "@/feature/dashboard/business/TrackspireKpisCard.tsx";

export function BusinessTab() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
                <RevenueFinanceCard />
            </div>
            <AppStoreMetricsCard />
            <TrackspireKpisCard />
        </div>
    );
}
