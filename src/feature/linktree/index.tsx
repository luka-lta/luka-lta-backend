import {useLinktreeList} from "@/feature/linktree/hooks/useLinktreeList.ts";
import LinktreeTable from "@/feature/linktree/components/LinktreeTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import LinksProvider from "@/feature/linktree/context/links-context.tsx";
import LinksDialogs from "@/feature/linktree/components/LinksDialogs.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";

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

    return (
        <Main>
            <LinksProvider>
                <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Links</h2>
                        <p className='text-muted-foreground'>
                            Manage your links here.
                        </p>
                    </div>
                </div>

                <LinktreeTable
                    links={linkList.data?.links ?? []}
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
