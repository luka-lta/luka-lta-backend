import { useMemo, useState } from "react";
import { Network, Search } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { PageToolbar } from "@/components/layout/page.tsx";
import { SearchInput } from "@/components/data/search-input.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
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
        <div className="space-y-3">
            <PageToolbar>
                <SearchInput value={search} onChange={setSearch} placeholder="Port oder Container…" />
                {search && <Button variant="ghost" onClick={() => setSearch("")}>Filter zurücksetzen</Button>}
            </PageToolbar>

            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Host-Port</TableHead>
                            <TableHead>Container-Port</TableHead>
                            <TableHead>Container</TableHead>
                            <TableHead className="hidden sm:table-cell">Host</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={4} className="p-0">
                                    {search ? (
                                        <EmptyState
                                            variant="plain"
                                            icon={Search}
                                            title="Keine Treffer"
                                            action={<Button variant="outline" size="sm" onClick={() => setSearch("")}>Filter zurücksetzen</Button>}
                                        />
                                    ) : (
                                        <EmptyState variant="plain" icon={Network} title="Keine veröffentlichten Ports" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((port) => (
                                <TableRow key={`${port.containerId}-${port.hostPort}-${port.containerPort}`}>
                                    <TableCell className="font-mono tabular-nums">{port.hostPort}</TableCell>
                                    <TableCell className="font-mono tabular-nums text-muted-foreground">{port.containerPort}</TableCell>
                                    <TableCell className="font-medium">{port.containerName}</TableCell>
                                    <TableCell className="hidden text-muted-foreground sm:table-cell">
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
