import {useLinktreeList} from "@/api/linktree/hooks.ts";
import LinktreeTable from "@/feature/linktree/components/LinktreeTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import LinksProvider from "@/feature/linktree/context/links-context.tsx";
import LinksDialogs from "@/feature/linktree/components/LinksDialogs.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";
import {LinktreeHeader} from "@/feature/linktree/components/LinktreeHeader.tsx";
import {LinktreeSummaryKpis} from "@/feature/linktree/components/LinktreeSummaryKpis.tsx";

function Linktree() {
    const [linkList, setFilterData] = useLinktreeList();
    useSetPageTitle('Backend - Linktree Overview');

    if (linkList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Links</h2>
                <ErrorState
                    title="Failed to load links"
                    message={linkList.error.message}
                    refetch={linkList.refetch}
                />
            </div>
        )
    }

    const links = linkList.data?.links ?? [];

    return (
        <Main>
            <LinksProvider>
                <LinktreeHeader links={links} onRefresh={async () => { await linkList.refetch(); }} />
                <LinktreeSummaryKpis links={links} />

                <LinktreeTable
                    links={links}
                    maxPages={linkList.data?.totalPages}
                    loading={linkList.isPending}
                    setFilterData={setFilterData}
                />

                <LinksDialogs />
            </LinksProvider>
        </Main>
    );
}

export default Linktree;
