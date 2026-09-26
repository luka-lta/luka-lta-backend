import {useEffect, useMemo, useState} from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {SortableHead} from "@/components/SortableHead.tsx";
import {TableSkeleton, SkeletonCell} from "@/components/TableSkeleton.tsx";
import {Pagination} from "@/components/Pagination.tsx";
import {EllipsisVertical, FilterX, ListTree, Pencil, Plus, Power, PowerOff, Search, Trash} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import CustomFaIcon from "@/components/CustomFaIcon.tsx";
import {Link, useNavigate} from "react-router-dom";
import {TimeCell} from "@/components/TimeCell.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useLinksContext} from "@/feature/linktree/context/links-context.tsx";
import LongText from "@/components/long-text.tsx";
import {Empty, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/kibo-ui/status/index.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const PAGE_SIZE = 20;
const col = createColumnHelper<LinkItemTypeSchema>();

interface LinktreeTableProps {
    links: LinkItemTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function LinktreeTable({links, maxPages, loading, setFilterData}: LinktreeTableProps) {
    const navigate = useNavigate();
    const {setOpen, setCurrentRow} = useLinksContext();

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

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
            displayname: debouncedSearch,
            sortColumn: sorting[0]?.id ?? '',
            sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, statusFilter, sorting]);

    const visibleLinks = useMemo(() => links.filter((l) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "deactivated") return l.deactivated;
        if (statusFilter === "active") return !l.deactivated && l.isActive;
        return !l.deactivated && !l.isActive; // inactive
    }), [links, statusFilter]);

    const columns = [
        col.accessor('clickTag', {
            header: 'Click Tag',
            enableSorting: false,
            cell: ({getValue}) => getValue().toUpperCase(),
        }),
        col.accessor('displayname', {
            id: 'displayname',
            header: 'Link',
            enableSorting: true,
            cell: ({row}) => (
                <div className="flex items-center gap-2 min-w-0">
                    <Avatar>
                        <AvatarFallback>
                            {/* @ts-expect-error - iconName is a free-form string, not a keyof typeof Icons */}
                            <CustomFaIcon name={row.original.iconName ?? undefined}/>
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-medium truncate">{row.original.displayname}</p>
                        <LongText className="max-w-48 text-xs text-muted-foreground">
                            {row.original.description || "No description"}
                        </LongText>
                    </div>
                </div>
            ),
        }),
        col.accessor('url', {
            header: 'URL',
            enableSorting: false,
            cell: ({getValue}) => (
                <Link to={getValue()} className="text-muted-foreground hover:text-blue-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <LongText className="max-w-36">{getValue()}</LongText>
                </Link>
            ),
        }),
        col.accessor('isActive', {
            id: 'is_active',
            header: 'Status',
            enableSorting: true,
            cell: ({row, getValue}) => {
                if (row.original.deactivated) {
                    return (
                        <Status status="maintenance">
                            <StatusIndicator/>
                            <StatusLabel>Deactivated</StatusLabel>
                        </Status>
                    );
                }
                return (
                    <Status status={getValue() ? "online" : "offline"}>
                        <StatusIndicator/>
                        <StatusLabel>{getValue() ? "Active" : "Inactive"}</StatusLabel>
                    </Status>
                );
            },
        }),
        col.accessor('createdOn', {
            id: 'created_at',
            header: 'Created At',
            enableSorting: true,
            cell: ({getValue}) => <TimeCell iso={getValue()}/>,
        }),
        col.display({
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({row}) => {
                const link = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" onClick={(e) => e.stopPropagation()}><EllipsisVertical/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/dashboard/linktree/${link.id}`);
                            }}>
                                <Pencil/>
                                Edit
                            </DropdownMenuItem>
                            {link.deactivated ? (
                                <DropdownMenuItem onClick={(event) => {
                                    event.stopPropagation();
                                    setOpen('activate');
                                    setCurrentRow(link);
                                }}>
                                    <Power/>
                                    Activate
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={(event) => {
                                    event.stopPropagation();
                                    setOpen('deactivate');
                                    setCurrentRow(link);
                                }}>
                                    <PowerOff/>
                                    Deactivate
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                setOpen('delete');
                                setCurrentRow(link);
                            }}>
                                <Trash/>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ];

    const table = useReactTable({
        data: visibleLinks,
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
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"/>
                        <Input
                            placeholder="Search links..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setSearchInput(""); setStatusFilter("all"); setPage(1); }}>
                        <FilterX className="h-4 w-4"/>
                        Clear
                    </Button>
                </div>
                <Button onClick={() => setOpen('add')}>
                    <Plus className="h-4 w-4"/>
                    New
                </Button>
            </div>

            <div className="border rounded-lg">
                {loading ? (
                    <TableSkeleton>
                        {() => (
                            <>
                                <SkeletonCell width="w-16"/>
                                <SkeletonCell width="w-40"/>
                                <SkeletonCell width="w-36" flex/>
                                <SkeletonCell width="w-20"/>
                                <SkeletonCell width="w-24"/>
                            </>
                        )}
                    </TableSkeleton>
                ) : (
                    <TooltipProvider>
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
                                                    <ListTree/>
                                                </EmptyMedia>
                                                <EmptyTitle>No links found</EmptyTitle>
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer"
                                            onClick={() => navigate(`/dashboard/linktree/${row.original.id}`)}
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
                    </TooltipProvider>
                )}
            </div>

            <Pagination
                page={page}
                totalPages={maxPages}
                rowCount={visibleLinks.length}
                isLoading={loading}
                onPageChange={setPage}
            />
        </div>
    );
}

export default LinktreeTable;
