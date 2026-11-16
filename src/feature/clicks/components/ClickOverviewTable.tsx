import { useEffect, useState } from "react";
import { createColumnHelper, getCoreRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { MousePointerClick, Search } from "lucide-react";
import Flag from "react-flagkit";
import { clickTypeSchema } from "@/feature/clicks/schema/clickSchema.ts";
import { OperatingSystem } from "@/components/operating-system.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { useClicksContext } from "@/feature/clicks/context/clicks-context.tsx";
import { DeviceLabel } from "@/feature/clicks/components/DeviceLabel.tsx";
import { DataTable } from "@/components/data/data-table.tsx";
import { TablePagination } from "@/components/data/table-pagination.tsx";
import { SearchInput } from "@/components/data/search-input.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { PageSection, PageToolbar } from "@/components/layout/page.tsx";
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts";

const PAGE_SIZE = 20;
const col = createColumnHelper<clickTypeSchema>();

interface ClickTableProps {
    clicks: clickTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function ClickOverviewTable({ clicks, maxPages, loading, setFilterData }: ClickTableProps) {
    const { setOpen, setCurrentRow } = useClicksContext();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search);
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => setPage(1), [debouncedSearch]);

    useEffect(() => {
        setFilterData({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            ip_address: debouncedSearch,
            sortColumn: sorting[0]?.id ?? '',
            sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, sorting]);

    const columns = [
        col.accessor('clickedAt', {
            id: 'clicked_at',
            header: 'Zeitpunkt',
            enableSorting: true,
            cell: ({ getValue }) => <TimeCell iso={getValue()} full />,
        }),
        col.accessor('url', {
            header: 'Ziel',
            enableSorting: true,
            meta: { skeletonClassName: 'w-40' },
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="max-w-[16rem] truncate">{row.original.url.replace(/^https?:\/\//, '')}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.original.clickTag}</p>
                </div>
            ),
        }),
        col.accessor('market', {
            header: 'Land',
            enableSorting: true,
            cell: ({ getValue }) => {
                const market = getValue();
                return market ? (
                    <span className="inline-flex items-center gap-1.5"><Flag country={market} size={16} />{market}</span>
                ) : <span className="text-muted-foreground">—</span>;
            },
        }),
        col.accessor('device', {
            header: 'Gerät',
            enableSorting: true,
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => <DeviceLabel device={getValue()} />,
        }),
        col.accessor('os', {
            header: 'System',
            enableSorting: true,
            meta: { className: 'hidden lg:table-cell' },
            cell: ({ getValue }) => getValue() ? (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><OperatingSystem os={getValue() ?? ''} />{getValue()}</span>
            ) : <span className="text-muted-foreground">—</span>,
        }),
        col.accessor('referer', {
            id: 'referrer',
            header: 'Referrer',
            enableSorting: true,
            meta: { className: 'hidden xl:table-cell' },
            cell: ({ getValue }) => <span className="block max-w-[12rem] truncate text-muted-foreground">{getValue() || '—'}</span>,
        }),
        col.accessor('ipAddress', {
            id: 'ip_address',
            header: 'IP-Adresse',
            enableSorting: true,
            meta: { className: 'hidden lg:table-cell' },
            cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() ?? '—'}</span>,
        }),
    ];

    const table = useReactTable({
        data: clicks,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: maxPages ?? -1,
    });

    return (
        <PageSection title="Einzelne Klicks" description="Jeder Aufruf eines Links mit Herkunft und Gerät.">
            <PageToolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Nach IP-Adresse suchen…" />
            </PageToolbar>
            <DataTable
                table={table}
                loading={loading}
                onRowClick={(row) => { setCurrentRow(row.original); setOpen('info'); }}
                empty={
                    debouncedSearch
                        ? <EmptyState variant="plain" icon={Search} title="Keine Treffer" description={`Kein Klick von „${debouncedSearch}“.`} />
                        : <EmptyState variant="plain" icon={MousePointerClick} title="Noch keine Klicks" />
                }
                footer={<TablePagination page={page} totalPages={maxPages} rowCount={clicks.length} isLoading={loading} onPageChange={setPage} />}
            />
        </PageSection>
    );
}

export default ClickOverviewTable;
