import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { Search } from "lucide-react";
import { listExposedPorts } from "@/feature/homelab/data.ts";
import type { Container, Host } from "@/feature/homelab/types.ts";

interface PortsOverviewProps {
    containers: Container[];
    hosts: Host[];
}

export function PortsOverview({ containers, hosts }: PortsOverviewProps) {
    const [search, setSearch] = useState("");
    const hostNameById = useMemo(() => new Map(hosts.map((h) => [h.id, h.name])), [hosts]);
    const ports = useMemo(() => listExposedPorts(containers), [containers]);

    const filtered = ports.filter((p) => {
        if (!search) return true;
        const needle = search.toLowerCase();
        return (
            p.hostPort.includes(needle) ||
            p.containerPort.includes(needle) ||
            p.containerName.toLowerCase().includes(needle)
        );
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Exposed ports</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search by port or container..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Host port</TableHead>
                            <TableHead>Container port</TableHead>
                            <TableHead>Container</TableHead>
                            <TableHead>Host</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="p-0">
                                    <Empty className="border-0 py-12">
                                        <EmptyMedia variant="icon">
                                            <Search />
                                        </EmptyMedia>
                                        <EmptyTitle>No exposed ports found</EmptyTitle>
                                    </Empty>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((port) => (
                                <TableRow key={`${port.containerId}-${port.hostPort}-${port.containerPort}`}>
                                    <TableCell className="font-mono tabular-nums">{port.hostPort}</TableCell>
                                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                                        {port.containerPort}
                                    </TableCell>
                                    <TableCell className="font-medium">{port.containerName}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {hostNameById.get(port.hostId) ?? port.hostId}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
