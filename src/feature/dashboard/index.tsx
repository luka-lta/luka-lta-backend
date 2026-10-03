import { Main } from '@/components/layout/main.tsx'
import Overview from '@/feature/dashboard/components/Overview.tsx'
import { DashboardHeader } from '@/feature/dashboard/components/DashboardHeader.tsx'
import { useClickSummary } from '@/api/dashboard/hooks.ts'
import { useLinktreeList } from '@/api/linktree/hooks.ts'
import { useBlogList } from '@/api/blog/hooks.ts'
import { useUserList } from '@/api/user/hooks.ts'
import { useAuthenticatedUserStore } from '@/store/authStore.ts'
import { useSetPageTitle } from '@/hooks/useSetPageTitle.ts'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'

function Dashboard() {
    const { user } = useAuthenticatedUserStore()
    const queryClient = useQueryClient()
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
                    onRefresh={handleRefresh}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            >
                <Overview />
            </motion.div>
        </Main>
    )
}

export default Dashboard
