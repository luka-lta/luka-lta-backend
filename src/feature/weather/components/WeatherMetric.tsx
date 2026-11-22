import type { ReactNode } from "react";
import { Navigation2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";

/** Grid of label/value pairs. Pass only metrics that have a value — nothing is padded with placeholders. */
export function MetricList({ className, children }: { className?: string; children: ReactNode }) {
    return <dl className={cn("grid gap-x-6 gap-y-4", className)}>{children}</dl>;
}

interface MetricProps {
    label: string;
    value: ReactNode;
    icon?: LucideIcon;
    /** Secondary line under the value, e.g. a classification or gusts. */
    hint?: ReactNode;
}

export function Metric({ label, value, icon: Icon, hint }: MetricProps) {
    return (
        <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
                {label}
            </dt>
            <dd className="mt-1 truncate text-sm font-medium tabular-nums text-foreground">{value}</dd>
            {hint && <dd className="truncate text-xs text-muted-foreground">{hint}</dd>}
        </div>
    );
}

/** Arrow pointing where the wind blows to — meteorological degrees name where it comes from. */
export function WindDirectionIcon({ degrees, className }: { degrees: number; className?: string }) {
    return (
        <Navigation2
            className={cn("size-3.5 shrink-0 fill-current", className)}
            style={{ transform: `rotate(${degrees + 180}deg)` }}
            aria-hidden
        />
    );
}
