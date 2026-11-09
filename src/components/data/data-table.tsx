import type { KeyboardEvent, ReactNode } from 'react'
import { flexRender, type Header, type Row, type RowData, type Table as TanstackTable } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        /** Zusätzliche Klassen für Kopf- und Datenzelle, z. B. "hidden md:table-cell". */
        className?: string
        /** Breite der Skeleton-Zelle im Ladezustand. */
        skeletonClassName?: string
    }
}

function SortableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
    const sorted = header.column.getIsSorted()
    const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ChevronsUpDown
    return (
        <button
            type='button'
            onClick={header.column.getToggleSortingHandler()}
            className='-ml-2 inline-flex h-7 items-center gap-1 rounded px-2 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
            {flexRender(header.column.columnDef.header, header.getContext())}
            <Icon className={cn('size-3.5', !sorted && 'opacity-40')} aria-hidden />
        </button>
    )
}

interface DataTableProps<TData> {
    table: TanstackTable<TData>
    loading?: boolean
    skeletonRows?: number
    /** Wird angezeigt, wenn keine Zeilen vorhanden sind (EmptyState mit variant="plain"). */
    empty: ReactNode
    onRowClick?: (row: Row<TData>) => void
    /** Pagination o. Ä. unterhalb der Tabelle, innerhalb des Rahmens. */
    footer?: ReactNode
    className?: string
}

/**
 * Einheitliche Tabellendarstellung für TanStack-Table-Instanzen:
 * Rahmen, Kopfzeile, Sortierung (inkl. aria-sort), Lade-, Leer- und Klickzustand.
 */
export function DataTable<TData>({ table, loading, skeletonRows = 8, empty, onRowClick, footer, className }: DataTableProps<TData>) {
    const columns = table.getVisibleLeafColumns()
    const rows = table.getRowModel().rows

    function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: Row<TData>) {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onRowClick?.(row)
        }
    }

    return (
        <div className={cn('overflow-hidden rounded-xl border bg-card shadow-xs', className)}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((group) => (
                        <TableRow key={group.id}>
                            {group.headers.map((header) => {
                                const sorted = header.column.getIsSorted()
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={header.column.columnDef.meta?.className}
                                        aria-sort={header.column.getCanSort() ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
                                    >
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <SortableHeader header={header} />
                                        ) : (
                                            flexRender(header.column.columnDef.header, header.getContext())
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody aria-busy={loading || undefined}>
                    {loading ? (
                        Array.from({ length: skeletonRows }, (_, i) => (
                            <TableRow key={i} className='hover:bg-transparent'>
                                {columns.map((column) => (
                                    <TableCell key={column.id} className={column.columnDef.meta?.className}>
                                        <Skeleton className={cn('h-4 w-24', column.columnDef.meta?.skeletonClassName)} />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length === 0 ? (
                        <TableRow className='hover:bg-transparent'>
                            <TableCell colSpan={columns.length} className='h-auto p-0'>
                                {empty}
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() ? 'selected' : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                onKeyDown={onRowClick ? (e) => handleKeyDown(e, row) : undefined}
                                className={cn(onRowClick && 'cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none')}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {footer}
        </div>
    )
}
