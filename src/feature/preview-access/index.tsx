import {useAccessTokensList} from "@/feature/preview-access/hooks/useAccessTokensList.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import AccessTokensList from "@/feature/preview-access/components/AccessTokensList.tsx";

function PreviewAccess() {
    const [previewAccessTokensList, setFilterData] = useAccessTokensList();

    if (previewAccessTokensList.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Preview-Access Tokens</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={previewAccessTokensList}/>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Preview-Access Tokens</h1>
                    </div>
                </div>
            </div>

            <div>
                <AccessTokensList
                    accessTokens={previewAccessTokensList.data?.tokens ?? []}
                    maxPages={previewAccessTokensList.data?.totalPages ?? 999}
                    loading={previewAccessTokensList.isPending}
                    setFilterData={setFilterData}
                />
            </div>
        </>
    );
}

export default PreviewAccess;