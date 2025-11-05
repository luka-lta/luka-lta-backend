import {Main} from "@/components/layout/main.tsx";
import {useClicksOverview} from "@/feature/clicks/hooks/useClicksOverview.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import ClickOverviewTable from "@/feature/clicks/components/ClickOverviewTable.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";

function Clicks() {
    const [clickOverview, setFilterData] = useClicksOverview();
    useSetPageTitle('Backend - Clicks Overview');

    if (clickOverview.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Clicks Overview</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={clickOverview}/>
                </div>
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Clicks Overview</h2>
                    <p className='text-muted-foreground'>
                        Inspect Link Clicks
                    </p>
                </div>
            </div>

            <ClickOverviewTable
                clicks={clickOverview.data?.clicks ?? []}
                maxPages={clickOverview.data?.totalPages ?? 999}
                loading={clickOverview.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default Clicks;