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
    infrastructure: "Infrastructure",
    network: "Network",
    service: "Services",
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
}

function hostFilterLabel(hosts: HostOption[], selectedHostIds: Set<string>): string {
    if (selectedHostIds.size === 0) return "All hosts";
    if (selectedHostIds.size === 1) {
        const [hostId] = selectedHostIds;
        return hosts.find((host) => host.id === hostId)?.name ?? hostId;
    }
    return `${selectedHostIds.size} hosts`;
}

function TopologyFilters({
    activeCategories,
    onToggleCategory,
    problemsOnly,
    onToggleProblemsOnly,
    hosts,
    selectedHostIds,
    onSelectedHostIdsChange,
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
                    <Button variant="outline" size="sm" disabled={hosts.length === 0}>
                        <Server className="h-3.5 w-3.5" />
                        {hostFilterLabel(hosts, selectedHostIds)}
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Filter by host</DropdownMenuLabel>
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
                        Show all hosts
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex flex-wrap items-center gap-1.5 border-l pl-3">
                {NODE_CATEGORIES.map((category) => (
                    <Toggle
                        key={category}
                        size="sm"
                        variant="outline"
                        pressed={activeCategories.has(category)}
                        onPressedChange={() => onToggleCategory(category)}
                    >
                        {CATEGORY_LABEL[category]}
                    </Toggle>
                ))}
            </div>
            <div className="flex items-center gap-2 border-l pl-3">
                <Switch id="problems-only" checked={problemsOnly} onCheckedChange={onToggleProblemsOnly} />
                <Label htmlFor="problems-only" className="text-sm font-normal">
                    Show only problems
                </Label>
            </div>
        </div>
    );
}

export default TopologyFilters;
