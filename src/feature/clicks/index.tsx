import {Main} from "@/components/layout/main.tsx";
import {useClicksOverview} from "@/feature/clicks/hooks/useClicksOverview.ts";
import ClickOverviewTable from "@/feature/clicks/components/ClickOverviewTable.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import ClicksProvider from "@/feature/clicks/context/clicks-context.tsx";
import ClicksDialogs from "@/feature/clicks/components/ClicksDialogs.tsx";
import {ErrorState} from "@/components/error-state.tsx";

function Clicks() {
    const [clickOverview, setFilterData] = useClicksOverview();
    useSetPageTitle('Backend - Clicks Overview');

    if (clickOverview.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Clicks Overview</h2>
                <ErrorState
                    title="Failed to load clicks"
                    message={clickOverview.error.message}
                    refetch={clickOverview.refetch}
                />
            </div>
        )
    }

    return (
        <ClicksProvider>
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
                    maxPages={clickOverview.data?.totalPages}
                    loading={clickOverview.isPending}
                    setFilterData={setFilterData}
                />
            </Main>

            <ClicksDialogs />
        </ClicksProvider>
    );
}

export default Clicks;
