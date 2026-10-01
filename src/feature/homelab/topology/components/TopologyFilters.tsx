import { Toggle } from "@/components/ui/toggle.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { NODE_CATEGORIES, type NodeCategory } from "@/feature/homelab/topology/constants.ts";

const CATEGORY_LABEL: Record<NodeCategory, string> = {
    infrastructure: "Infrastructure",
    network: "Network",
    service: "Services",
};

interface TopologyFiltersProps {
    activeCategories: Set<NodeCategory>;
    onToggleCategory: (category: NodeCategory) => void;
    problemsOnly: boolean;
    onToggleProblemsOnly: (value: boolean) => void;
}

function TopologyFilters({ activeCategories, onToggleCategory, problemsOnly, onToggleProblemsOnly }: TopologyFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
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
