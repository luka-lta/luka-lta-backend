import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DayOverviewSection } from '@/feature/dashboard/widgets/DayOverviewSection.tsx'
import { QuickStats } from '@/feature/dashboard/components/QuickStats.tsx'
import { RecentActivity } from '@/feature/dashboard/components/RecentActivity.tsx'
import { useClickSummary } from '@/api/dashboard/hooks.ts'
import { useLinktreeList } from '@/api/linktree/hooks.ts'
import { useBlogList } from '@/api/blog/hooks.ts'
import { useUserList } from '@/api/user/hooks.ts'
import { getApiErrorMessage } from '@/lib/apiError.ts'

interface DataProblem {
    id: string
    label: string
    error: unknown
    refetch: () => void
}

function Overview() {
    const [clickSummary] = useClickSummary()
    const [linktreeList] = useLinktreeList()
    const [blogList] = useBlogList()
    const [userList] = useUserList()

    const links = linktreeList.data?.links ?? []
    const posts = blogList.data?.posts ?? []

    const problems: DataProblem[] = []
    if (clickSummary.error) problems.push({ id: 'clicks', label: 'Klicks', error: clickSummary.error, refetch: () => clickSummary.refetch() })
    if (linktreeList.error) problems.push({ id: 'links', label: 'Links', error: linktreeList.error, refetch: () => linktreeList.refetch() })
    if (blogList.error) problems.push({ id: 'blog', label: 'Blog', error: blogList.error, refetch: () => blogList.refetch() })
    if (userList.error) problems.push({ id: 'users', label: 'Benutzer', error: userList.error, refetch: () => userList.refetch() })

    return (
        <div className='space-y-6'>
            {problems.length > 0 && (
                <Alert variant='warning'>
                    <AlertTriangle />
                    <AlertTitle>Nicht alle Daten konnten geladen werden</AlertTitle>
                    <AlertDescription>
                        <ul className='mt-2 space-y-1.5'>
                            {problems.map((problem) => (
                                <li key={problem.id} className='flex flex-wrap items-center justify-between gap-2'>
                                    <span>
                                        <span className='font-medium text-foreground'>{problem.label}:</span> {getApiErrorMessage(problem.error)}
                                    </span>
                                    <Button variant='outline' size='sm' className='h-7' onClick={problem.refetch}>
                                        <RefreshCcw />
                                        Erneut versuchen
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <QuickStats
                totalClicks={clickSummary.data?.summary.totalClicks}
                clicksMonthly={clickSummary.data?.summary.clicksMonthly}
            />

            <DayOverviewSection />

            <RecentActivity
                loading={blogList.isPending || linktreeList.isPending}
                posts={posts}
                links={links}
            />
        </div>
    )
}

export default Overview
