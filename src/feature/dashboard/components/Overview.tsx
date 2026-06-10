import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
    Compass,
    Languages,
    MousePointerClick,
    TrendingUp,
    Users,
} from 'lucide-react'
import ClicksChart from '@/feature/dashboard/components/ClicksChart.tsx'
import Referrer from '@/feature/dashboard/components/referrer.tsx'
import { useClickSummary } from '@/feature/dashboard/hooks/useClickSummary.ts'
import { browserUsage, marketUsage, osUsage } from '@/feature/dashboard/data.ts'
import { Pages } from '@/feature/dashboard/components/Pages.tsx'
import { Devices } from '@/feature/dashboard/components/Devices.tsx'
import { Countries } from '@/feature/dashboard/components/Countries.tsx'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number | undefined
    sub?: string
    icon: React.ReactNode
    accent: string
    delay?: number
}

function StatCard({ title, value, sub, icon, accent, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        >
            <Card className='card-hover overflow-hidden relative border'>
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 h-0.5 rounded-t-lg',
                        accent
                    )}
                />
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 pt-4'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                        {title}
                    </CardTitle>
                    <div className={cn('p-1.5 rounded-md', accent.replace('bg-', 'bg-').replace('500', '100').replace('600', '100') + ' dark:opacity-20')}>
                        {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold tracking-tight'>
                        {value ?? '—'}
                    </div>
                    {sub && (
                        <p className='text-muted-foreground text-xs mt-1 flex items-center gap-1'>
                            <TrendingUp className='w-3 h-3 text-emerald-500' />
                            {sub}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

function Overview() {
    const [clickSummary] = useClickSummary()

    const stats: StatCardProps[] = [
        {
            title: 'Total Clicks',
            value: clickSummary.data?.summary.totalClicks,
            sub: '+20.1% from last month',
            icon: <MousePointerClick className='h-4 w-4 text-violet-600 dark:text-violet-400' />,
            accent: 'bg-violet-500',
        },
        {
            title: 'Browsers Tracked',
            value: browserUsage.length,
            icon: <Users className='h-4 w-4 text-sky-600 dark:text-sky-400' />,
            accent: 'bg-sky-500',
        },
        {
            title: 'Operating Systems',
            value: osUsage.length,
            icon: <Compass className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />,
            accent: 'bg-emerald-500',
        },
        {
            title: 'Markets Tracked',
            value: marketUsage.length,
            icon: <Languages className='h-4 w-4 text-amber-600 dark:text-amber-400' />,
            accent: 'bg-amber-500',
        },
    ]

    return (
        <>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {stats.map((stat, i) => (
                    <StatCard key={stat.title} {...stat} delay={i * 0.08} />
                ))}
            </div>

            <motion.div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
            >
                <Card className='col-span-2'>
                    <CardHeader>
                        <CardTitle>Click Overview</CardTitle>
                        <CardDescription>Last 5 months</CardDescription>
                    </CardHeader>
                    <CardContent className='pl-2'>
                        <ClicksChart
                            clicksMonthly={clickSummary.data?.summary.clicksMonthly ?? []}
                        />
                    </CardContent>
                </Card>

                <Referrer className='col-span-1' />
                <Pages className='col-span-1' />
                <Devices className='col-span-1' />
                <Countries className='col-span-1' />
            </motion.div>
        </>
    )
}

export default Overview
