import {useApiKeyList} from "@/feature/apiKey/hooks/useApiKeyList.ts";
import ApiKeyTable from "@/feature/apiKey/components/ApiKeyTable.tsx";
import {Main} from "@/components/layout/main.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {ErrorState} from "@/components/error-state.tsx";

function ApiKeys() {
    const [apiKeyList, setFilterData] = useApiKeyList();
    useSetPageTitle('Backend - Api-Key Overview');

    if (apiKeyList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Api-Keys</h2>
                <ErrorState
                    title="Failed to load API keys"
                    message={apiKeyList.error.message}
                    refetch={apiKeyList.refetch}
                />
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
                maxPages={apiKeyList.data?.totalPages}
                loading={apiKeyList.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default ApiKeys;
