import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {useClickSummary} from "./hooks/useClickSummary";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Main} from "@/components/layout/main.tsx";
import Overview from "@/feature/dashboard/components/Overview.tsx";
import Analytics from "@/feature/dashboard/components/analytics/Analytics.tsx";
import {useAuthenticatedUserStore} from "@/feature/login/hooks/useAuthenticatedStore.ts";

function Dashboard() {
    const [clickSummary] = useClickSummary();
    const {user} = useAuthenticatedUserStore();

    if (clickSummary.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Dashboard</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={clickSummary}/>
                </div>
            </div>
        );
    }

    return (
        <Main>
            <div className='mb-2 flex items-center justify-between space-y-2'>
                <h1 className='text-2xl font-bold tracking-tight'>Hi, {user?.username}👋</h1>
                <div className='flex items-center space-x-2'>
                    <Button>Download</Button>
                </div>
            </div>
            <Tabs
                orientation='vertical'
                defaultValue='overview'
                className='space-y-4'
            >
                <div className='w-full overflow-x-auto pb-2'>
                    <TabsList>
                        <TabsTrigger value='overview'>Overview</TabsTrigger>
                        <TabsTrigger value='analytics'>
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value='reports' disabled>
                            Reports
                        </TabsTrigger>
                        <TabsTrigger value='notifications' disabled>
                            Notifications
                        </TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value='overview' className='space-y-4'>
                    <Overview />
                </TabsContent>
                <TabsContent value={'analytics'} className='space-y-4'>
                    <Analytics />
                </TabsContent>
            </Tabs>
        </Main>
    );
}

export default Dashboard;