import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, getCoreRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Link2, Pencil, Power, PowerOff, Search, Trash2 } from "lucide-react";
import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { LinkIcon } from "@/components/LinkIcon.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { useLinksContext } from "@/feature/linktree/context/links-context.tsx";
import { DataTable } from "@/components/data/data-table.tsx";
import { TablePagination } from "@/components/data/table-pagination.tsx";
import { SearchInput } from "@/components/data/search-input.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { PageToolbar } from "@/components/layout/page.tsx";
import { useDebouncedValue } from "@/hooks/use-debounced-value.ts";
import { getLinkStatus, LINK_STATUS, type LinkStatus } from "@/feature/linktree/linkStatus.ts";
import { LinkStatusBadge } from "@/feature/linktree/components/LinkStatusBadge.tsx";
import { useReactivateLink } from "@/feature/linktree/components/useToggleLinkActivation.ts";

const PAGE_SIZE = 20;
const col = createColumnHelper<LinkItemTypeSchema>();

interface LinktreeTableProps {
    links: LinkItemTypeSchema[];
    maxPages?: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function LinktreeTable({ links, maxPages, loading, setFilterData }: LinktreeTableProps) {
    const navigate = useNavigate();
    const { setOpen, setCurrentRow } = useLinksContext();
    const reactivate = useReactivateLink();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [statusFilter, setStatusFilter] = useState<LinkStatus | "all">("all");
    const hasFilter = debouncedSearch !== "" || statusFilter !== "all";

    useEffect(() => setPage(1), [debouncedSearch]);

    useEffect(() => {
        setFilterData({
            page: String(page),
            pageSize: String(PAGE_SIZE),
            displayname: debouncedSearch,
            sortColumn: sorting[0]?.id ?? '',
            sortDirection: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch, sorting]);

    // Der Statusfilter wirkt auf die geladene Seite (die API kennt keinen Statusfilter).
    const visibleLinks = useMemo(
        () => (statusFilter === "all" ? links : links.filter((l) => getLinkStatus(l) === statusFilter)),
        [links, statusFilter],
    );

    function openDialog(kind: 'delete' | 'deactivate', link: LinkItemTypeSchema) {
        setCurrentRow(link);
        setOpen(kind);
    }

    function resetFilters() {
        setSearch("");
        setStatusFilter("all");
        setPage(1);
    }

    const columns = [
        col.accessor('displayname', {
            id: 'displayname',
            header: 'Link',
            enableSorting: true,
            meta: { skeletonClassName: 'w-48' },
            cell: ({ row }) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <LinkIcon name={row.original.iconName} className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{row.original.displayname}</p>
                        <p className="max-w-[16rem] truncate text-xs text-muted-foreground">{row.original.description || row.original.url}</p>
                    </div>
                </div>
            ),
        }),
        col.accessor('url', {
            header: 'Ziel',
            enableSorting: false,
            meta: { className: 'hidden lg:table-cell', skeletonClassName: 'w-40' },
            cell: ({ getValue }) => (
                <a
                    href={getValue()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex max-w-[14rem] items-center gap-1 text-muted-foreground hover:text-primary"
                >
                    <span className="truncate">{getValue().replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="size-3 shrink-0" aria-hidden />
                </a>
            ),
        }),
        col.accessor('clickTag', {
            header: 'Tag',
            enableSorting: false,
            meta: { className: 'hidden xl:table-cell' },
            cell: ({ getValue }) => <code className="font-mono text-xs text-muted-foreground">{getValue()}</code>,
        }),
        col.accessor('isActive', {
            id: 'is_active',
            header: 'Status',
            enableSorting: true,
            cell: ({ row }) => <LinkStatusBadge link={row.original} />,
        }),
        col.accessor('createdOn', {
            id: 'created_at',
            header: 'Erstellt',
            enableSorting: true,
            meta: { className: 'hidden md:table-cell' },
            cell: ({ getValue }) => <TimeCell iso={getValue()} />,
        }),
        col.display({
            id: 'actions',
            header: () => <span className="sr-only">Aktionen</span>,
            meta: { className: 'w-12 text-right', skeletonClassName: 'w-6' },
            cell: ({ row }) => {
                const link = row.original;
                return (
                    <RowActions
                        label={link.displayname}
                        actions={[
                            { label: 'Bearbeiten', icon: Pencil, onSelect: () => navigate(`/dashboard/linktree/${link.id}`) },
                            { label: 'Öffnen', icon: ExternalLink, onSelect: () => window.open(link.url, '_blank', 'noopener') },
                            { label: 'Aktivieren', icon: Power, hidden: !link.deactivated, onSelect: () => reactivate(link) },
                            { label: 'Deaktivieren', icon: PowerOff, hidden: link.deactivated, onSelect: () => openDialog('deactivate', link) },
                            { label: 'Löschen', icon: Trash2, destructive: true, onSelect: () => openDialog('delete', link) },
                        ]}
                    />
                );
            },
        }),
    ];

    const table = useReactTable({
        data: visibleLinks,
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
                <SearchInput value={search} onChange={setSearch} placeholder="Links durchsuchen…" />
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LinkStatus | "all")}>
                    <SelectTrigger className="w-full sm:w-40" aria-label="Nach Status filtern">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        {(Object.keys(LINK_STATUS) as LinkStatus[]).map((status) => (
                            <SelectItem key={status} value={status}>{LINK_STATUS[status].label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hasFilter && (
                    <Button variant="ghost" onClick={resetFilters}>Filter zurücksetzen</Button>
                )}
            </PageToolbar>

            <DataTable
                table={table}
                loading={loading}
                onRowClick={(row) => navigate(`/dashboard/linktree/${row.original.id}`)}
                empty={
                    hasFilter ? (
                        <EmptyState
                            variant="plain"
                            icon={Search}
                            title="Keine Treffer"
                            description="Kein Link passt zu Suche oder Filter."
                            action={<Button variant="outline" size="sm" onClick={resetFilters}>Filter zurücksetzen</Button>}
                        />
                    ) : (
                        <EmptyState
                            variant="plain"
                            icon={Link2}
                            title="Noch keine Links"
                            description="Lege deinen ersten Link an, um Klicks zu tracken."
                            action={<Button variant="outline" size="sm" onClick={() => setOpen('add')}>Link anlegen</Button>}
                        />
                    )
                }
                footer={<TablePagination page={page} totalPages={maxPages} rowCount={visibleLinks.length} isLoading={loading} onPageChange={setPage} />}
            />
        </div>
    );
}

export default LinktreeTable;
