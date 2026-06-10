import {useClicks} from "@/feature/dashboard/hooks/useClicks.ts";
import {Main} from "@/components/layout/main.tsx";
import AnalyticsItem from "@/feature/dashboard/components/analytics/AnalyticsItem.tsx";
import {ErrorState} from "@/components/error-state.tsx";

function Analytics() {
    const [clicks, setFilterData] = useClicks();

    if (clicks.error) {
        return (
            <div className='p-6'>
                <ErrorState
                    title="Failed to load analytics"
                    message={clicks.error.message}
                    refetch={clicks.refetch}
                />
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Clicks</h2>
                    <p className='text-muted-foreground'>
                        Analyze your clicks here.
                    </p>
                </div>
            </div>

            <div>
                <AnalyticsItem
                    clicks={clicks.data?.clicks ?? []}
                    loading={clicks.isPending}
                    setFilterData={setFilterData}
                />
            </div>
        </Main>
    );
}

export default Analytics;