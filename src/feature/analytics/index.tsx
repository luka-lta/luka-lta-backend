import AnalyticsItem from "@/feature/analytics/components/AnalyticsItem.tsx";
import {useClicks} from "./hooks/useClicks";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";

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
        <>
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Clicks</h1>
                    </div>
                </div>
            </div>

            <div>
                <AnalyticsItem
                    clicks={clicks.data?.clicks ?? []}
                    loading={clicks.isPending}
                    setFilterData={setFilterData}
                />
            </div>
        </>
    );
}

export default Analytics;