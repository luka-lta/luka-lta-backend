import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {useApiKeyList} from "@/feature/apiKey/hooks/useApiKeyList.ts";
import ApiKeyTable from "@/feature/apiKey/components/ApiKeyTable.tsx";
import {Main} from "@/components/layout/main.tsx";

function ApiKeys() {
    const [apiKeyList, setFilterData] = useApiKeyList();

    if (apiKeyList.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Api-Keys</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={apiKeyList}/>
                </div>
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Api-Keys</h2>
                    <p className='text-muted-foreground'>
                        Manage your api keys here.
                    </p>
                </div>
            </div>

            <ApiKeyTable
                apiKeys={apiKeyList.data?.apiKeys ?? []}
                maxPages={apiKeyList.data?.totalPages ?? 999}
                loading={apiKeyList.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default ApiKeys;