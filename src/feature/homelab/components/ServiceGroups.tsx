import { cn } from "@/lib/utils.ts";
import { groupContainersByService, type ServiceGroup } from "@/feature/homelab/data.ts";
import type { Alert, Container } from "@/feature/homelab/types.ts";

interface ServiceGroupsProps {
    containers: Container[];
    alerts: Alert[];
    activeProject: string | null;
    onSelectProject: (project: string | null) => void;
}

const STATUS_DOT: Record<ServiceGroup["status"], string> = {
    healthy: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500",
};

export function ServiceGroups({ containers, alerts, activeProject, onSelectProject }: ServiceGroupsProps) {
    const groups = groupContainersByService(containers, alerts);

    if (groups.length === 0) return null;

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Services</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groups.map((group) => {
                    const running = group.containers.filter((c) => c.status === "running").length;
                    const isActive = activeProject === group.id;

                    return (
                        <button
                            key={group.id}
                            type="button"
                            onClick={() => onSelectProject(isActive ? null : group.id)}
                            className={cn(
                                "text-left rounded-lg border p-3 transition-colors hover:bg-muted/50",
                                isActive && "border-primary ring-1 ring-primary",
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[group.status])} />
                                <span className="font-medium text-sm truncate">{group.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {running} / {group.containers.length} running
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
