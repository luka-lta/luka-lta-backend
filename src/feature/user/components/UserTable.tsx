import { useEffect, useState } from "react";
import { createColumnHelper, getCoreRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { Pencil, Search, Trash2 } from "lucide-react";
import { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts";
import { TimeCell } from "@/components/TimeCell.tsx";
import { useUsers } from "@/feature/user/context/users-context.tsx";
import { DataTable } from "@/components/data/data-table.tsx";
import { TablePagination } from "@/components/data/table-pagination.tsx";
import { SearchInput } from "@/components/data/search-input.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";
import { UserAvatar } from "@/components/data/user-avatar.tsx";
import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { PageToolbar } from "@/components/layout/page.tsx";
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts";

const PAGE_SIZE = 20;
const col = createColumnHelper<UserTypeSchema>();

interface UserTableProps {
    users: UserTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function UserTable({ users, maxPages, loading, setFilterData }: UserTableProps) {
    const { setOpen, setCurrentRow } = useUsers();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search);
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => setPage(1), [debouncedSearch]);

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

    function open(kind: 'info' | 'edit' | 'delete', user: UserTypeSchema) {
        setCurrentRow(user);
        setOpen(kind);
    }

    const columns = [
        col.accessor('username', {
            header: 'Benutzer',
            enableSorting: true,
            meta: { skeletonClassName: 'w-40' },
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <UserAvatar name={row.original.username} email={row.original.email} avatarUrl={row.original.avatarUrl} />
                    <div className="min-w-0">
                        <p className="truncate font-medium">{row.original.username}</p>
                        <p className="truncate text-xs text-muted-foreground md:hidden">{row.original.email}</p>
                    </div>
                </div>
            ),
        }),
        col.accessor('email', {
            header: 'E-Mail',
            enableSorting: true,
            meta: { className: 'hidden md:table-cell', skeletonClassName: 'w-48' },
            cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
        }),
        col.accessor('isActive', {
            id: 'is_active',
            header: 'Status',
            enableSorting: true,
            cell: ({ getValue }) => (
                <StatusBadge tone={getValue() ? 'success' : 'neutral'}>{getValue() ? 'Aktiv' : 'Inaktiv'}</StatusBadge>
            ),
        }),
        col.accessor('lastActive', {
            id: 'last_active',
            header: 'Zuletzt aktiv',
            enableSorting: true,
            meta: { className: 'hidden lg:table-cell' },
            cell: ({ getValue }) => {
                const v = getValue();
                return v ? <TimeCell iso={v.toString()} /> : <span className="text-sm text-muted-foreground">—</span>;
            },
        }),
        col.display({
            id: 'actions',
            header: () => <span className="sr-only">Aktionen</span>,
            enableSorting: false,
            meta: { className: 'w-12 text-right', skeletonClassName: 'w-6' },
            cell: ({ row }) => (
                <RowActions
                    label={row.original.username}
                    actions={[
                        { label: 'Bearbeiten', icon: Pencil, onSelect: () => open('edit', row.original) },
                        { label: 'Löschen', icon: Trash2, destructive: true, onSelect: () => open('delete', row.original) },
                    ]}
                />
            ),
        }),
    ];

    const table = useReactTable({
        data: users,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: maxPages ?? -1,
    });

    return (
        <div className="space-y-3">
            <PageToolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Nach E-Mail suchen…" />
            </PageToolbar>
            <DataTable
                table={table}
                loading={loading}
                onRowClick={(row) => open('info', row.original)}
                empty={
                    debouncedSearch ? (
                        <EmptyState variant="plain" icon={Search} title="Keine Treffer" description={`Kein Benutzer passt zu „${debouncedSearch}“.`} />
                    ) : (
                        <EmptyState variant="plain" title="Noch keine Benutzer" />
                    )
                }
                footer={<TablePagination page={page} totalPages={maxPages} rowCount={users.length} isLoading={loading} onPageChange={setPage} />}
            />
        </div>
    );
}

export default UserTable;
