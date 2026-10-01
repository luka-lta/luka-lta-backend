import {useEffect, useState} from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {useQueryClient} from "@tanstack/react-query";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {SortableHead} from "@/components/SortableHead.tsx";
import {TableSkeleton, SkeletonCell} from "@/components/TableSkeleton.tsx";
import {Pagination} from "@/components/Pagination.tsx";
import {FilterX, Monitor, MousePointerClick, Search, Smartphone, Tablet} from "lucide-react";
import {clickTypeSchema} from "@/feature/clicks/schema/clickSchema.ts";
import Flag from "react-flagkit";
import LongText from "@/components/long-text.tsx";
import {UserAgentInfo} from "@/components/user-agent-icon.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";
import {useClicksContext} from "@/feature/clicks/context/clicks-context.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Empty, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {RefreshButton} from "@/components/refresh-button.tsx";

const PAGE_SIZE = 20;
const col = createColumnHelper<clickTypeSchema>();

interface ClickTableProps {
    clicks: clickTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function ClickOverviewTable({clicks, maxPages, loading, setFilterData}: ClickTableProps) {
    const queryClient = useQueryClient();
    const {setOpen, setCurrentRow} = useClicksContext();

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

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
        col.accessor('clickTag', {
            header: 'Click Tag',
            enableSorting: false,
        }),
        col.accessor('url', {
            header: 'URL',
            enableSorting: true,
            cell: ({getValue}) => <LongText className="max-w-36">{getValue()}</LongText>,
        }),
        col.accessor('ipAddress', {
            id: 'ip_address',
            header: 'IP Address',
            enableSorting: true,
            cell: ({getValue}) => getValue() ?? '-',
        }),
        col.accessor('market', {
            header: 'Market',
            enableSorting: true,
            cell: ({getValue}) => getValue() ? <Flag country={getValue()!}/> : '-',
        }),
        col.accessor('userAgent', {
            id: 'user_agent',
            header: 'User Agent',
            enableSorting: true,
            cell: ({getValue}) => (
                <LongText className="max-w-36">
                    <UserAgentInfo userAgent={getValue() ?? "-"}/>
                </LongText>
            ),
        }),
        col.accessor('os', {
            header: 'OS',
            enableSorting: true,
            cell: ({getValue}) => (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <OperatingSystem os={getValue() || ''}/>
                    {getValue() || '-'}
                </div>
            ),
        }),
        col.accessor('device', {
            header: 'Device',
            enableSorting: true,
            cell: ({getValue}) => (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    {getValue() === "Desktop" && <Monitor className="w-4 h-4"/>}
                    {getValue() === "Mobile" && <Smartphone className="w-4 h-4"/>}
                    {getValue() === "Tablet" && <Tablet className="w-4 h-4"/>}
                    {getValue() || '-'}
                </div>
            ),
        }),
        col.accessor('referer', {
            id: 'referrer',
            header: 'Referrer',
            enableSorting: true,
            cell: ({getValue}) => getValue() ?? '-',
        }),
        col.accessor('clickedAt', {
            id: 'clicked_at',
            header: 'Clicked at',
            enableSorting: true,
        }),
    ];

    const table = useReactTable({
        data: clicks,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: maxPages ?? -1,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"/>
                    <Input
                        placeholder="Search IP..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setSearchInput("")}>
                        <FilterX className="h-4 w-4"/>
                        Clear
                    </Button>
                    <RefreshButton onRefresh={() => queryClient.invalidateQueries({queryKey: ['clicks', 'overview']})}/>
                </div>
            </div>

            <div className="border rounded-lg">
                {loading ? (
                    <TableSkeleton>
                        {() => (
                            <>
                                <SkeletonCell width="w-20"/>
                                <SkeletonCell width="w-36" flex/>
                                <SkeletonCell width="w-24"/>
                                <SkeletonCell width="w-16"/>
                                <SkeletonCell width="w-24"/>
                            </>
                        )}
                    </TableSkeleton>
                ) : (
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((hg) => (
                                <TableRow key={hg.id}>
                                    {hg.headers.map((header) =>
                                        header.column.getCanSort() ? (
                                            <SortableHead key={header.id} column={header.column}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </SortableHead>
                                        ) : (
                                            <TableHead key={header.id}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    )}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                                        <Empty className="border-0 py-12">
                                            <EmptyMedia variant="icon">
                                                <MousePointerClick/>
                                            </EmptyMedia>
                                            <EmptyTitle>No clicks found</EmptyTitle>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setOpen('info');
                                            setCurrentRow(row.original);
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Pagination
                page={page}
                totalPages={maxPages}
                rowCount={clicks.length}
                isLoading={loading}
                onPageChange={setPage}
            />
        </div>
    );
}

export default ClickOverviewTable;
