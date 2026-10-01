import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main.tsx'
import Overview from '@/feature/dashboard/components/Overview.tsx'
import Analytics from '@/feature/dashboard/components/analytics/Analytics.tsx'
import { BusinessTab } from '@/feature/dashboard/business/BusinessTab.tsx'
import { DashboardHeader } from '@/feature/dashboard/components/DashboardHeader.tsx'
import { useClickSummary } from '@/api/dashboard/hooks.ts'
import { useLinktreeList } from '@/api/linktree/hooks.ts'
import { useBlogList } from '@/api/blog/hooks.ts'
import { useUserList } from '@/api/user/hooks.ts'
import { useAuthenticatedUserStore } from '@/store/authStore.ts'
import { useSetPageTitle } from '@/hooks/useSetPageTitle.ts'
import { toSqlUtcNow } from '@/lib/dateTimeUtils.ts'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'

function Dashboard() {
    const { user } = useAuthenticatedUserStore()
    const queryClient = useQueryClient()
    const [lastUpdated, setLastUpdated] = useState(() => toSqlUtcNow())
    useSetPageTitle('Backend - Dashboard')

    // Cheap: shares the react-query cache with Overview's own subscriptions, no extra fetch.
    const [clickSummary] = useClickSummary()
    const [linktreeList] = useLinktreeList()
    const [blogList] = useBlogList()
    const [userList] = useUserList()
    const hasErrors = Boolean(clickSummary.error || linktreeList.error || blogList.error || userList.error)

    async function handleRefresh() {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['summary'] }),
            queryClient.invalidateQueries({ queryKey: ['clicks'] }),
            queryClient.invalidateQueries({ queryKey: ['linktree'] }),
            queryClient.invalidateQueries({ queryKey: ['blog'] }),
            queryClient.invalidateQueries({ queryKey: ['users'] }),
        ])
        setLastUpdated(toSqlUtcNow())
    }

    return (
        <Main>
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className='mb-6'
            >
                <DashboardHeader
                    username={user?.username ?? 'there'}
                    status={hasErrors ? "degraded" : "online"}
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            >
                <Tabs defaultValue='overview' className='space-y-6'>
                    <TabsList className='h-9'>
                        <TabsTrigger value='overview'>Overview</TabsTrigger>
                        <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                        <TabsTrigger value='business'>Business</TabsTrigger>
                    </TabsList>
                    <TabsContent value='overview' className='space-y-4'>
                        <Overview />
                    </TabsContent>
                    <TabsContent value='analytics' className='space-y-4'>
                        <Analytics />
                    </TabsContent>
                    <TabsContent value='business' className='space-y-4'>
                        <BusinessTab />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </Main>
    )
}

export default Dashboard
