import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

interface TopologySearchProps {
    value: string;
    onChange: (value: string) => void;
}

function TopologySearch({ value, onChange }: TopologySearchProps) {
    return (
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
                placeholder="Search infrastructure..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-8 pr-8"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0.5 top-1/2 size-7 -translate-y-1/2"
                    onClick={() => onChange("")}
                >
                    <X className="size-3.5" />
                </Button>
            )}
        </div>
    );
}

export default TopologySearch;
