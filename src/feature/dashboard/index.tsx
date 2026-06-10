import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClickSummary } from './hooks/useClickSummary'
import { Main } from '@/components/layout/main.tsx'
import Overview from '@/feature/dashboard/components/Overview.tsx'
import Analytics from '@/feature/dashboard/components/analytics/Analytics.tsx'
import { useAuthenticatedUserStore } from '@/feature/login/hooks/useAuthenticatedStore.ts'
import { useSetPageTitle } from '@/hooks/useSetPageTitle.ts'
import { ErrorState } from '@/components/error-state.tsx'
import { motion } from 'motion/react'

function getGreeting(name: string): { greeting: string; sub: string } {
    const hour = new Date().getHours()
    if (hour < 5)  return { greeting: `Good night, ${name}`,  sub: "Burning the midnight oil?" }
    if (hour < 12) return { greeting: `Good morning, ${name}`, sub: "Ready to build something great today?" }
    if (hour < 17) return { greeting: `Good afternoon, ${name}`, sub: "Hope the afternoon is treating you well." }
    if (hour < 21) return { greeting: `Good evening, ${name}`, sub: "Wrapping up for the day?" }
    return { greeting: `Hey, ${name}`,  sub: "Still at it — respect." }
}

function Dashboard() {
    const [clickSummary] = useClickSummary()
    const { user } = useAuthenticatedUserStore()
    useSetPageTitle('Backend - Dashboard')

    if (clickSummary.error) {
        return (
            <div className='p-6'>
                <h1 className='text-2xl font-bold tracking-tight mb-4'>Dashboard</h1>
                <ErrorState
                    title="Failed to load dashboard data"
                    message={clickSummary.error.message}
                    refetch={clickSummary.refetch}
                />
            </div>
        )
    }

    const { greeting, sub } = getGreeting(user?.username ?? 'there')

    return (
        <Main>
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className='mb-6'
            >
                <h1 className='text-3xl font-bold tracking-tight'>
                    {greeting} <span className='wave'>👋</span>
                </h1>
                <p className='text-muted-foreground mt-1 text-sm'>{sub}</p>
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
                    </TabsList>
                    <TabsContent value='overview' className='space-y-4'>
                        <Overview />
                    </TabsContent>
                    <TabsContent value='analytics' className='space-y-4'>
                        <Analytics />
                    </TabsContent>
                </Tabs>
            </motion.div>
        </Main>
    )
}

export default Dashboard
