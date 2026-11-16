import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TablePaginationProps {
    page: number
    totalPages?: number
    /** Anzahl der aktuell angezeigten Zeilen. */
    rowCount: number
    isLoading?: boolean
    onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, rowCount, isLoading, onPageChange }: TablePaginationProps) {
    const pages = Math.max(totalPages ?? 1, 1)
    const multiple = pages > 1

    return (
        <nav aria-label='Seitennavigation' className='flex items-center justify-between gap-4 border-t px-4 py-2.5'>
            <p className='text-xs text-muted-foreground' aria-live='polite'>
                {rowCount === 0
                    ? 'Keine Einträge'
                    : multiple
                        ? `Seite ${page} von ${pages}`
                        : `${rowCount.toLocaleString('de-DE')} ${rowCount === 1 ? 'Eintrag' : 'Einträge'}`}
            </p>
            {multiple && (
                <div className='flex items-center gap-1'>
                    <Button variant='outline' size='icon-sm' disabled={page <= 1 || isLoading} onClick={() => onPageChange(page - 1)}>
                        <ChevronLeft />
                        <span className='sr-only'>Vorherige Seite</span>
                    </Button>
                    <Button variant='outline' size='icon-sm' disabled={page >= pages || isLoading} onClick={() => onPageChange(page + 1)}>
                        <ChevronRight />
                        <span className='sr-only'>Nächste Seite</span>
                    </Button>
                </div>
            )}
        </nav>
    )
}
