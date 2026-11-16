import { Toggle } from "@/components/ui/toggle.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { ChevronDown, Server } from "lucide-react";
import { NODE_CATEGORIES, type NodeCategory } from "@/feature/homelab/topology/constants.ts";

const CATEGORY_LABEL: Record<NodeCategory, string> = {
    infrastructure: "Infrastruktur",
    network: "Netzwerk",
    service: "Dienste",
};

export interface HostOption {
    id: string;
    name: string;
}

interface TopologyFiltersProps {
    activeCategories: Set<NodeCategory>;
    onToggleCategory: (category: NodeCategory) => void;
    problemsOnly: boolean;
    onToggleProblemsOnly: (value: boolean) => void;
    hosts: HostOption[];
    selectedHostIds: Set<string>;
    onSelectedHostIdsChange: (hostIds: Set<string>) => void;
    showPeerLinks: boolean;
    onToggleShowPeerLinks: (value: boolean) => void;
}

function hostFilterLabel(hosts: HostOption[], selectedHostIds: Set<string>): string {
    if (selectedHostIds.size === 0) return "Alle Hosts";
    if (selectedHostIds.size === 1) {
        const [hostId] = selectedHostIds;
        return hosts.find((host) => host.id === hostId)?.name ?? hostId;
    }
    return `${selectedHostIds.size} Hosts`;
}

function TopologyFilters({
    activeCategories,
    onToggleCategory,
    problemsOnly,
    onToggleProblemsOnly,
    hosts,
    selectedHostIds,
    onSelectedHostIdsChange,
    showPeerLinks,
    onToggleShowPeerLinks,
}: TopologyFiltersProps) {
    function toggleHost(hostId: string, checked: boolean) {
        const next = new Set(selectedHostIds);
        if (checked) {
            next.add(hostId);
        } else {
            next.delete(hostId);
        }
        onSelectedHostIdsChange(next);
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 bg-card" disabled={hosts.length === 0}>
                        <Server />
                        {hostFilterLabel(hosts, selectedHostIds)}
                        <ChevronDown className="opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Nach Host filtern</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {hosts.map((host) => (
                        <DropdownMenuCheckboxItem
                            key={host.id}
                            checked={selectedHostIds.has(host.id)}
                            onCheckedChange={(checked) => toggleHost(host.id, checked === true)}
                            onSelect={(event) => event.preventDefault()}
                        >
                            {host.name}
                        </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        disabled={selectedHostIds.size === 0}
                        onSelect={() => onSelectedHostIdsChange(new Set())}
                    >
                        Alle Hosts anzeigen
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-wrap items-center gap-1.5 border-l pl-3" role="group" aria-label="Kategorien">
                {NODE_CATEGORIES.map((category) => (
                    <Toggle
                        key={category}
                        size="sm"
                        variant="outline"
                        className="h-8 bg-card data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                        pressed={activeCategories.has(category)}
                        onPressedChange={() => onToggleCategory(category)}
                    >
                        {CATEGORY_LABEL[category]}
                    </Toggle>
                ))}
            </div>
            <div className="flex items-center gap-2 border-l pl-3">
                <Switch id="peer-links" checked={showPeerLinks} onCheckedChange={onToggleShowPeerLinks} />
                <Label htmlFor="peer-links" className="text-sm font-normal">
                    Peer-Verbindungen
                </Label>
            </div>
            <div className="flex items-center gap-2 border-l pl-3">
                <Switch id="problems-only" checked={problemsOnly} onCheckedChange={onToggleProblemsOnly} />
                <Label htmlFor="problems-only" className="text-sm font-normal">
                    Nur Probleme
                </Label>
            </div>
        </div>
    );
}

export default TopologyFilters;
