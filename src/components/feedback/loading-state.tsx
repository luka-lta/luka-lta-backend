import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** Platzhalter für ein Raster aus Cards (KPI-Zeile, Card-Grids). */
export function CardGridSkeleton({ count = 4, className, itemClassName }: { count?: number; className?: string; itemClassName?: string }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)} aria-busy='true' aria-label='Wird geladen'>
            {Array.from({ length: count }, (_, i) => (
                <Skeleton key={i} className={cn('h-28 rounded-xl', itemClassName)} />
            ))}
        </div>
    )
}

/** Platzhalter für eine Detailseite: Kopf + Inhaltsblöcke. */
export function DetailPageSkeleton() {
    return (
        <div className='space-y-6' aria-busy='true' aria-label='Wird geladen'>
            <div className='space-y-2'>
                <Skeleton className='h-7 w-64' />
                <Skeleton className='h-4 w-40' />
            </div>
            <div className='grid gap-4 lg:grid-cols-3'>
                <Skeleton className='h-80 rounded-xl lg:col-span-2' />
                <Skeleton className='h-80 rounded-xl' />
            </div>
        </div>
    )
}
