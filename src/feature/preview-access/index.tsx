import {useAccessTokensList} from "@/feature/preview-access/hooks/useAccessTokensList.ts";
import AccessTokensList from "@/feature/preview-access/components/AccessTokensList.tsx";
import {Main} from "@/components/layout/main.tsx";
import {ErrorState} from "@/components/error-state.tsx";

function PreviewAccess() {
    const [previewAccessTokensList, setFilterData] = useAccessTokensList();

    if (previewAccessTokensList.error) {
        return (
            <div className='p-6'>
                <h2 className='text-2xl font-bold tracking-tight mb-4'>Preview-Access Tokens</h2>
                <ErrorState
                    title="Failed to load access tokens"
                    message={previewAccessTokensList.error.message}
                    refetch={previewAccessTokensList.refetch}
                />
            </div>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Preview-Access Tokens</h2>
                    <p className='text-muted-foreground'>
                        Manage your preview-access tokens here.
                    </p>
                </div>
            </div>

            <AccessTokensList
                accessTokens={previewAccessTokensList.data?.tokens ?? []}
                maxPages={previewAccessTokensList.data?.totalPages}
                loading={previewAccessTokensList.isPending}
                setFilterData={setFilterData}
            />
        </Main>
    );
}

export default PreviewAccess;
