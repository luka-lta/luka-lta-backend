import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx'
import ClicksChart from '@/feature/dashboard/components/ClicksChart.tsx'
import TimeLineClicksChart from '@/feature/dashboard/components/TimeLineClicksChart.tsx'
import { DashboardSummaryKpis } from '@/feature/dashboard/components/DashboardSummaryKpis.tsx'
import { BusinessSummaryKpis } from '@/feature/dashboard/business/BusinessSummaryKpis.tsx'
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
        <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                <BusinessSummaryKpis />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}>
                <DashboardSummaryKpis
                    totalClicks={clickSummary.data?.summary.totalClicks}
                    clicksMonthly={clickSummary.data?.summary.clicksMonthly}
                    activeLinks={linktreeList.data ? links.filter((l) => l.isActive && !l.deactivated).length : undefined}
                    publishedPosts={blogList.data ? posts.filter((p) => p.isPublished).length : undefined}
                    teamMembers={userList.data?.users.length}
                />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}>
                <DashboardAlerts alerts={alerts} />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Click Overview</CardTitle>
                        <CardDescription>Last 5 months</CardDescription>
                    </CardHeader>
                    <CardContent className='pl-2'>
                        <ClicksChart clicksMonthly={clickSummary.data?.summary.clicksMonthly ?? []} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='p-0'>
                        <TimeLineClicksChart clicksDaily={clickSummary.data?.summary.clicksDaily ?? []} />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}>
                <RecentActivity posts={[...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)} links={[...links].sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()).slice(0, 6)} />
            </motion.div>
        </>
    )
}

export default Overview
