import {useClicks} from "@/feature/dashboard/hooks/useClicks.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Main} from "@/components/layout/main.tsx";
import AnalyticsItem from "@/feature/dashboard/components/analytics/AnalyticsItem.tsx";

function Analytics() {
    const [clicks, setFilterData] = useClicks();

    if (clicks.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Analytics</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={clicks}/>
                </div>
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