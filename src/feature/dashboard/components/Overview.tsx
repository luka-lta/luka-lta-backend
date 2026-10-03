import { DayOverviewSection } from '@/feature/dashboard/widgets/DayOverviewSection.tsx'
import { QuickStats } from '@/feature/dashboard/components/QuickStats.tsx'
import { DashboardAlerts } from '@/feature/dashboard/components/DashboardAlerts.tsx'
import { RecentActivity } from '@/feature/dashboard/components/RecentActivity.tsx'
import { useClickSummary } from '@/api/dashboard/hooks.ts'
import { useLinktreeList } from '@/api/linktree/hooks.ts'
import { useBlogList } from '@/api/blog/hooks.ts'
import { useUserList } from '@/api/user/hooks.ts'
import { motion } from 'motion/react'

function Overview() {
    const [clickSummary] = useClickSummary()
    const [linktreeList] = useLinktreeList()
    const [blogList] = useBlogList()
    const [userList] = useUserList()

    const links = linktreeList.data?.links ?? []
    const posts = blogList.data?.posts ?? []

    const alerts: { id: string; title: string; description: string; refetch: () => void }[] = []
    if (clickSummary.error) alerts.push({ id: 'clicks', title: 'Clicks data unavailable', description: clickSummary.error.message, refetch: () => clickSummary.refetch() })
    if (linktreeList.error) alerts.push({ id: 'linktree', title: 'Linktree data unavailable', description: linktreeList.error.message, refetch: () => linktreeList.refetch() })
    if (blogList.error) alerts.push({ id: 'blog', title: 'Blog data unavailable', description: blogList.error.message, refetch: () => blogList.refetch() })
    if (userList.error) alerts.push({ id: 'users', title: 'User data unavailable', description: userList.error.message, refetch: () => userList.refetch() })

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                <DayOverviewSection />
            </motion.div>

            {alerts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                    <DashboardAlerts alerts={alerts} />
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}>
                <QuickStats
                    totalClicks={clickSummary.data?.summary.totalClicks}
                    clicksMonthly={clickSummary.data?.summary.clicksMonthly}
                />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}>
                <RecentActivity
                    posts={[...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)}
                    links={[...links].sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()).slice(0, 5)}
                />
            </motion.div>
        </div>
    )
}

export default Overview
