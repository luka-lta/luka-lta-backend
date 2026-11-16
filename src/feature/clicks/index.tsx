import { useClicksOverview } from "@/api/clicks/hooks.ts";
import ClickOverviewTable from "@/feature/clicks/components/ClickOverviewTable.tsx";
import { ClicksAnalyticsSummary } from "@/feature/clicks/components/ClicksAnalyticsSummary.tsx";
import ClicksProvider from "@/feature/clicks/context/clicks-context.tsx";
import ClicksDialogs from "@/feature/clicks/components/ClicksDialogs.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";

function Clicks() {
    const [clickOverview, setFilterData] = useClicksOverview();

    return (
        <ClicksProvider>
            <PageContainer title="Klicks">
                <PageHeader title="Klicks" description="Wie oft deine Links aufgerufen werden — und von wo." />
                <ClicksAnalyticsSummary />
                {clickOverview.error ? (
                    <ErrorState title="Klicks konnten nicht geladen werden" error={clickOverview.error} onRetry={() => clickOverview.refetch()} />
                ) : (
                    <ClickOverviewTable
                        clicks={clickOverview.data?.clicks ?? []}
                        maxPages={clickOverview.data?.totalPages}
                        loading={clickOverview.isPending}
                        setFilterData={setFilterData}
                    />
                )}
            </PageContainer>
            <ClicksDialogs />
        </ClicksProvider>
    );
}

export default Clicks;
