import { useMemo, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { SortableHead } from "@/components/SortableHead.tsx";
import { Pagination } from "@/components/Pagination.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { FilterX, Search } from "lucide-react";
import { ContainerStatusBadge, HealthBadge } from "@/feature/homelab/components/ContainerStatusBadge.tsx";
import type { Container, Host } from "@/feature/homelab/types.ts";
import { formatUptime, getComposeProjectKey } from "@/feature/homelab/data.ts";

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
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [hostFilter, setHostFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [sorting, setSorting] = useState<SortingState>([]);

    const hostNameById = useMemo(() => new Map(hosts.map((h) => [h.id, h.name])), [hosts]);

    const filtered = useMemo(() => {
        return containers.filter((c) => {
            if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.image.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            if (statusFilter !== "all" && c.status !== statusFilter) return false;
            if (hostFilter !== "all" && c.hostId !== hostFilter) return false;
            if (projectFilter && getComposeProjectKey(c) !== projectFilter) return false;
            return true;
        });
    }, [containers, search, statusFilter, hostFilter, projectFilter]);

    const sorted = useMemo(() => {
        if (!sorting[0]) return filtered;
        const { id, desc } = sorting[0];
        const copy = [...filtered];
        copy.sort((a, b) => {
            const av = (a as unknown as Record<string, unknown>)[id];
            const bv = (b as unknown as Record<string, unknown>)[id];
            if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv;
            return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });
        return copy;
    }, [filtered, sorting]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const columns = [
        col.accessor("name", {
            header: "Name",
            enableSorting: true,
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.image}</p>
                </div>
            ),
        }),
        col.accessor("status", {
            header: "Status",
            enableSorting: true,
            cell: ({ getValue }) => <ContainerStatusBadge status={getValue()} />,
        }),
        col.accessor("hostId", {
            header: "Host",
            enableSorting: true,
            cell: ({ getValue }) => <span className="text-sm">{hostNameById.get(getValue()) ?? getValue()}</span>,
        }),
        col.accessor("uptimeSeconds", {
            header: "Uptime",
            enableSorting: true,
            cell: ({ getValue }) => <span className="text-sm tabular-nums">{formatUptime(getValue())}</span>,
        }),
        col.accessor("cpuUsagePercent", {
            header: "CPU",
            enableSorting: true,
            cell: ({ getValue }) => <span className="text-sm tabular-nums">{getValue().toFixed(1)}%</span>,
        }),
        col.accessor("memoryUsedMb", {
            header: "RAM",
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-sm tabular-nums">
                    {row.original.memoryUsedMb} / {row.original.memoryLimitMb} MB
                </span>
            ),
        }),
        col.accessor("restartCount", {
            header: "Restarts",
            enableSorting: true,
            cell: ({ getValue }) => {
                const count = getValue();
                return (
                    <span className={count > 3 ? "text-sm font-medium text-rose-500" : "text-sm text-muted-foreground"}>
                        {count}
                    </span>
                );
            },
        }),
        col.accessor("healthStatus", {
            header: "Health",
            enableSorting: true,
            cell: ({ getValue }) => <HealthBadge status={getValue()} />,
        }),
        col.accessor("lastHealthCheck", {
            header: "Last check",
            enableSorting: false,
            cell: ({ getValue }) => {
                const v = getValue();
                return v ? <TimeCell iso={v} /> : <span className="text-muted-foreground text-sm">N/A</span>;
            },
        }),
    ];

    const table = useReactTable({
        data: pageRows,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search by name or image..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="unhealthy">Unhealthy</SelectItem>
                            <SelectItem value="stopped">Stopped</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={hostFilter} onValueChange={(v) => { setHostFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Host" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All hosts</SelectItem>
                            {hosts.map((h) => (
                                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {projectFilter && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium">
                            Service filter active
                        </span>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setHostFilter("all");
                            setPage(1);
                            onClearProjectFilter?.();
                        }}
                    >
                        <FilterX className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg">
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
                                            <Search />
                                        </EmptyMedia>
                                        <EmptyTitle>No containers found</EmptyTitle>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer"
                                    onClick={() => onSelectContainer(row.original)}
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
            </div>

            <Pagination page={page} totalPages={totalPages} rowCount={sorted.length} onPageChange={setPage} />
        </div>
    );
}
