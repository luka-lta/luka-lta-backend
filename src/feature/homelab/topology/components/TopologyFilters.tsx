import { Toggle } from "@/components/ui/toggle.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { NODE_CATEGORIES, type NodeCategory } from "@/feature/homelab/topology/constants.ts";

const CATEGORY_LABEL: Record<NodeCategory, string> = {
    infrastructure: "Infrastruktur",
    network: "Netzwerk",
    service: "Dienste",
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
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Kategorien">
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
                <Switch id="problems-only" checked={problemsOnly} onCheckedChange={onToggleProblemsOnly} />
                <Label htmlFor="problems-only" className="text-sm font-normal">
                    Nur Probleme
                </Label>
            </div>
        </div>
    );
}

export default TopologyFilters;
