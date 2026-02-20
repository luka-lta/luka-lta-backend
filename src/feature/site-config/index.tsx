import {Main} from "@/components/layout/main.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {useSite} from "@/feature/site-config/hooks/useSite.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";

function SiteConfig() {
    const [siteInfo] = useSite();
    useSetPageTitle('Backend - Site-Configuration');

    if (siteInfo.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Site Configuration</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={siteInfo}/>
                </div>
            </div>
        )
    }

    if (!siteInfo.data?.site) {
        return (
            <h1>No Data</h1>
        )
    }

    return (
        <Main>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Site Configuration</h2>
                    <p className='text-muted-foreground'>
                        Manage your web tracking
                    </p>
                </div>
            </div>

{/*
            <SiteConfigurationFields siteMetadata={siteInfo.data?.site} />
*/}
        </Main>
    );
}

export default SiteConfig;