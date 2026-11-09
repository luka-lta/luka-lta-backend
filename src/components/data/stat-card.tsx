import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export interface StatTrend {
    /** Veränderung in Prozent, z. B. 12 oder -4. */
    value: number
    label?: string
    /** true, wenn ein Anstieg negativ ist (z. B. Fehlerquote). */
    invert?: boolean
}

interface StatCardProps {
    label: string
    /** `undefined` zeigt den Ladezustand. */
    value: number | string | undefined
    format?: (value: number) => string
    icon?: LucideIcon
    hint?: ReactNode
    trend?: StatTrend
    /** Link zur Detailansicht — macht die ganze Karte klickbar. */
    href?: string
    /** Kennzeichnet Beispiel-/Demo-Daten. */
    demo?: boolean
    /** Tonalität des Werts, z. B. "warning" bei offenen Problemen. */
    tone?: 'default' | 'success' | 'warning' | 'danger'
    className?: string
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
    default: '',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
}

function TrendLine({ trend }: { trend: StatTrend }) {
    const up = trend.value >= 0
    const good = trend.invert ? !up : up
    const Icon = up ? ArrowUpRight : ArrowDownRight
    return (
        <span className={cn('inline-flex items-center gap-0.5 font-medium', good ? 'text-success' : 'text-destructive')}>
            <Icon className='size-3.5' aria-hidden />
            {up ? '+' : ''}{trend.value}%
            {trend.label && <span className='ml-1 font-normal text-muted-foreground'>{trend.label}</span>}
        </span>
    )
}

/** Einheitliche Kennzahl-Karte für alle KPI-Zeilen. */
export function StatCard({ label, value, format, icon: Icon, hint, trend, href, demo, tone = 'default', className }: StatCardProps) {
    const display = typeof value === 'number' ? (format ? format(value) : value.toLocaleString('de-DE')) : value

    const body = (
        <Card className={cn('group relative flex h-full flex-col gap-2 p-5', href && 'transition-colors duration-fast hover:border-primary/40', className)}>
            <div className='flex items-center justify-between gap-2'>
                <span className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                    {Icon && <Icon className='size-4' aria-hidden />}
                    {label}
                </span>
                {demo && <Badge variant='neutral'>Demo</Badge>}
                {!demo && href && (
                    <ChevronRight className='size-4 text-muted-foreground/50 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-foreground' aria-hidden />
                )}
            </div>
            {display === undefined ? (
                <Skeleton className='h-8 w-24' />
            ) : (
                <p className={cn('text-2xl font-semibold tabular-nums tracking-tight', TONE[tone])}>{display}</p>
            )}
            {(trend || hint) && (
                <div className='flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground'>
                    {trend && <TrendLine trend={trend} />}
                    {hint}
                </div>
            )}
        </Card>
    )

    if (!href) return body
    return (
        <Link to={href} className='block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'>
            {body}
        </Link>
    )
}

/** Raster für StatCards: 1 / 2 / 4 Spalten. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>
}
