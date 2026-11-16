import { useEffect, useMemo, useState } from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { Container as ContainerIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { PageToolbar } from "@/components/layout/page.tsx";
import { SearchInput } from "@/components/data/search-input.tsx";
import { DataTable } from "@/components/data/data-table.tsx";
import { TablePagination } from "@/components/data/table-pagination.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ContainerStatusBadge, HealthBadge } from "@/feature/homelab/components/ContainerStatusBadge.tsx";
import { CONTAINER_STATUS } from "@/feature/homelab/status.ts";
import type { Container, ContainerStatus, Host } from "@/feature/homelab/types.ts";
import { formatUptime, getComposeProjectKey } from "@/feature/homelab/data.ts";
import { cn } from "@/lib/utils.ts";

const PAGE_SIZE = 10;
const col = createColumnHelper<Container>();

interface ContainerTableProps {
    containers: Container[];
    hosts: Host[];
    onSelectContainer: (container: Container) => void;
    projectFilter?: string | null;
    onClearProjectFilter?: () => void;
}

export function ContainerTable({
    containers,
    hosts,
    onSelectContainer,
    projectFilter = null,
    onClearProjectFilter,
}: ContainerTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ContainerStatus | "all">("all");
    const [hostFilter, setHostFilter] = useState<string>("all");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });

    const hostNameById = useMemo(() => new Map(hosts.map((h) => [h.id, h.name])), [hosts]);
    const hasFilter = search !== "" || statusFilter !== "all" || hostFilter !== "all" || projectFilter !== null;

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return containers.filter((c) => {
            if (query && !c.name.toLowerCase().includes(query) && !c.image.toLowerCase().includes(query)) return false;
            if (statusFilter !== "all" && c.status !== statusFilter) return false;
            if (hostFilter !== "all" && c.hostId !== hostFilter) return false;
            if (projectFilter && getComposeProjectKey(c) !== projectFilter) return false;
            return true;
        });
    }, [containers, search, statusFilter, hostFilter, projectFilter]);

    useEffect(() => setPagination((p) => ({ ...p, pageIndex: 0 })), [search, statusFilter, hostFilter, projectFilter]);

    function resetFilters() {
        setSearch("");
        setStatusFilter("all");
        setHostFilter("all");
        onClearProjectFilter?.();
    }

    const columns = [
        col.accessor("name", {
            header: "Container",
            meta: { skeletonClassName: "w-40" },
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{row.original.name}</p>
                    <p className="max-w-[18rem] truncate font-mono text-xs text-muted-foreground">{row.original.image}</p>
                </div>
            ),
        }),
        col.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => <ContainerStatusBadge status={getValue()} />,
        }),
        col.accessor((c) => hostNameById.get(c.hostId) ?? c.hostId, {
            id: "host",
            header: "Host",
            meta: { className: "hidden md:table-cell" },
            cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
        }),
        col.accessor("uptimeSeconds", {
            header: "Uptime",
            meta: { className: "hidden lg:table-cell" },
            cell: ({ getValue }) => <span className="tabular-nums">{formatUptime(getValue())}</span>,
        }),
        col.accessor("cpuUsagePercent", {
            header: "CPU",
            meta: { className: "hidden sm:table-cell text-right" },
            cell: ({ getValue }) => <span className="tabular-nums">{getValue().toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</span>,
        }),
        col.accessor("memoryUsedMb", {
            header: "RAM",
            meta: { className: "hidden lg:table-cell text-right" },
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {row.original.memoryUsedMb.toLocaleString("de-DE")} / {row.original.memoryLimitMb.toLocaleString("de-DE")} MB
                </span>
            ),
        }),
        col.accessor("restartCount", {
            header: "Neustarts",
            meta: { className: "hidden xl:table-cell text-right" },
            cell: ({ getValue }) => {
                const count = getValue();
                return <span className={cn("tabular-nums", count > 3 ? "font-medium text-destructive" : "text-muted-foreground")}>{count}</span>;
            },
        }),
        col.accessor("healthStatus", {
            header: "Health",
            meta: { className: "hidden md:table-cell" },
            cell: ({ getValue }) => <HealthBadge status={getValue()} />,
        }),
        col.accessor("lastHealthCheck", {
            header: "Letzter Check",
            enableSorting: false,
            meta: { className: "hidden xl:table-cell" },
            cell: ({ getValue }) => {
                const v = getValue();
                return v ? <TimeCell iso={v} /> : <span className="text-muted-foreground">—</span>;
            },
        }),
    ];

    const table = useReactTable({
        data: filtered,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-3">
            <PageToolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Name oder Image…" />
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContainerStatus | "all")}>
                    <SelectTrigger className="w-full sm:w-40" aria-label="Nach Status filtern">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        {(Object.keys(CONTAINER_STATUS) as ContainerStatus[]).map((status) => (
                            <SelectItem key={status} value={status}>{CONTAINER_STATUS[status].label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {hosts.length > 1 && (
                    <Select value={hostFilter} onValueChange={setHostFilter}>
                        <SelectTrigger className="w-full sm:w-40" aria-label="Nach Host filtern">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Hosts</SelectItem>
                            {hosts.map((h) => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {projectFilter && <Badge variant="info">Dienst: {projectFilter}</Badge>}
                {hasFilter && <Button variant="ghost" onClick={resetFilters}>Filter zurücksetzen</Button>}
            </PageToolbar>

            <DataTable
                table={table}
                onRowClick={(row) => onSelectContainer(row.original)}
                empty={
                    hasFilter ? (
                        <EmptyState
                            variant="plain"
                            icon={Search}
                            title="Keine Treffer"
                            description="Kein Container passt zu Suche oder Filter."
                            action={<Button variant="outline" size="sm" onClick={resetFilters}>Filter zurücksetzen</Button>}
                        />
                    ) : (
                        <EmptyState variant="plain" icon={ContainerIcon} title="Keine Container gemeldet" />
                    )
                }
                footer={
                    <TablePagination
                        page={pagination.pageIndex + 1}
                        totalPages={table.getPageCount()}
                        rowCount={filtered.length}
                        onPageChange={(page) => table.setPageIndex(page - 1)}
                    />
                }
            />
        </div>
    );
}
