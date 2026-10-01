import {useEffect, useState} from "react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";
import {useQueryClient} from "@tanstack/react-query";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {SortableHead} from "@/components/SortableHead.tsx";
import {TableSkeleton, SkeletonCell} from "@/components/TableSkeleton.tsx";
import {Pagination} from "@/components/Pagination.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {splitAvatarUrl} from "@/lib/utils.ts";
import {TimeCell} from "@/components/TimeCell.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/kibo-ui/status/index.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {EllipsisVertical, FilterX, Pencil, Plus, Search, Trash} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Empty, EmptyMedia, EmptyTitle} from "@/components/ui/empty.tsx";
import {useUsers} from "@/feature/user/context/users-context.tsx";
import {RefreshButton} from "@/components/refresh-button.tsx";

const PAGE_SIZE = 20;
const col = createColumnHelper<UserTypeSchema>();

interface UserTableProps {
    users: UserTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function UserTable({users, maxPages, loading, setFilterData}: UserTableProps) {
    const queryClient = useQueryClient();
    const {setOpen, setCurrentRow} = useUsers();

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
            email: debouncedSearch,
            sortColumn: sorting[0]?.id ?? '',
            sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, sorting]);

    const columns = [
        col.display({
            id: 'avatar',
            header: 'Avatar',
            enableSorting: false,
            cell: ({row}) => (
                <Avatar>
                    <AvatarImage src={splitAvatarUrl(row.original.avatarUrl)} alt={row.original.email}/>
                    <AvatarFallback>{row.original.email[0]}</AvatarFallback>
                </Avatar>
            ),
        }),
        col.accessor('username', {
            header: 'Username',
            enableSorting: true,
        }),
        col.accessor('email', {
            header: 'Email',
            enableSorting: true,
        }),
        col.accessor('isActive', {
            id: 'is_active',
            header: 'Status',
            enableSorting: true,
            cell: ({getValue}) => (
                <Status status={getValue() ? "online" : "offline"}>
                    <StatusIndicator/>
                    <StatusLabel>{getValue() ? "Active" : "Inactive"}</StatusLabel>
                </Status>
            ),
        }),
        col.accessor('lastActive', {
            id: 'last_active',
            header: 'Last active',
            enableSorting: true,
            cell: ({getValue}) => {
                const v = getValue();
                return v ? <TimeCell iso={v.toString()}/> : <span className="text-muted-foreground">N/A</span>;
            },
        }),
        col.display({
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({row}) => {
                const user = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" onClick={(e) => e.stopPropagation()}><EllipsisVertical/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                setOpen('edit');
                                setCurrentRow(user);
                            }}>
                                <Pencil/>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(event) => {
                                event.stopPropagation();
                                setOpen('delete');
                                setCurrentRow(user);
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
        data: users,
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
                        placeholder="Search by email..."
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
                    <RefreshButton onRefresh={() => queryClient.invalidateQueries({queryKey: ['users', 'list']})}/>
                    <Button onClick={() => setOpen('add')}>
                        <Plus className="h-4 w-4"/>
                        New
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg">
                {loading ? (
                    <TableSkeleton>
                        {() => (
                            <>
                                <SkeletonCell width="w-8"/>
                                <SkeletonCell width="w-32"/>
                                <SkeletonCell width="w-48"/>
                                <SkeletonCell width="w-20"/>
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
                                                <Search/>
                                            </EmptyMedia>
                                            <EmptyTitle>No users found</EmptyTitle>
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
                rowCount={users.length}
                isLoading={loading}
                onPageChange={setPage}
            />
        </div>
    );
}

export default UserTable;
