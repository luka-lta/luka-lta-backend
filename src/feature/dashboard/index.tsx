import { useState } from 'react'
import { DateTime } from 'luxon'
import { RefreshCcw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button.tsx'
import { PageContainer, PageHeader } from '@/components/layout/page.tsx'
import { StatusBadge } from '@/components/feedback/status-badge.tsx'
import Overview from '@/feature/dashboard/components/Overview.tsx'
import { useClickSummary } from '@/api/dashboard/hooks.ts'
import { useLinktreeList } from '@/api/linktree/hooks.ts'
import { useBlogList } from '@/api/blog/hooks.ts'
import { useUserList } from '@/api/user/hooks.ts'
import { useAuthenticatedUserStore } from '@/store/authStore.ts'
import { cn } from '@/lib/utils.ts'

function getGreeting(name: string | undefined): string {
    const hour = new Date().getHours()
    const suffix = name ? `, ${name}` : ''
    if (hour < 5) return `Gute Nacht${suffix}`
    if (hour < 11) return `Guten Morgen${suffix}`
    if (hour < 18) return `Hallo${suffix}`
    return `Guten Abend${suffix}`
}

function Dashboard() {
    const { user } = useAuthenticatedUserStore()
    const queryClient = useQueryClient()
    const [refreshing, setRefreshing] = useState(false)

    // Teilt sich den react-query-Cache mit Overview – kein zusätzlicher Request.
    const [clickSummary] = useClickSummary()
    const [linktreeList] = useLinktreeList()
    const [blogList] = useBlogList()
    const [userList] = useUserList()
    const hasErrors = Boolean(clickSummary.error || linktreeList.error || blogList.error || userList.error)

    async function handleRefresh() {
        setRefreshing(true)
        try {
            await Promise.all(
                ['summary', 'clicks', 'linktree', 'blog', 'users', 'calendar', 'weather', 'apps'].map((key) =>
                    queryClient.invalidateQueries({ queryKey: [key] }),
                ),
            )
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <PageContainer title='Übersicht'>
            <PageHeader
                title={getGreeting(user?.username)}
                description={
                    <span className='flex flex-wrap items-center gap-2'>
                        <span>{DateTime.now().toFormat('cccc, d. LLLL')}</span>
                        <span aria-hidden>·</span>
                        {hasErrors ? (
                            <StatusBadge tone='warning'>Einige Daten fehlen</StatusBadge>
                        ) : (
                            <StatusBadge tone='success'>Alles erreichbar</StatusBadge>
                        )}
                    </span>
                }
                actions={
                    <Button variant='outline' onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCcw className={cn(refreshing && 'animate-spin')} />
                        Aktualisieren
                    </Button>
                }
            />
            <Overview />
        </PageContainer>
    )
}

export default Dashboard
