import {useLinktreeList} from "@/feature/linktree/hooks/useLinktreeList.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import LinktreeTable from "@/feature/linktree/components/LinktreeTable.tsx";
import {Main} from "@/components/layout/main.tsx";

function Linktree() {
    const [linkList, setFilterData] = useLinktreeList();

    if (linkList.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Links</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={linkList}/>
                </div>
            </div>
        )
    }

    return (
        <Main>
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
                maxPages={linkList.data?.totalPages ?? 999}
                loading={linkList.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default Linktree;