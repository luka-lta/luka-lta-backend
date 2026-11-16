import { PageSection } from "@/components/layout/page.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { groupContainersByService, type ServiceGroup } from "@/feature/homelab/data.ts";
import { SERVICE_STATUS } from "@/feature/homelab/status.ts";
import type { Alert, Container } from "@/feature/homelab/types.ts";

interface ServiceGroupsProps {
    containers: Container[];
    alerts: Alert[];
    activeProject: string | null;
    onSelectProject: (project: string | null) => void;
}

const STATUS_DOT: Record<ServiceGroup["status"], string> = {
    healthy: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive",
};

export function ServiceGroups({ containers, alerts, activeProject, onSelectProject }: ServiceGroupsProps) {
    const groups = groupContainersByService(containers, alerts);

    if (groups.length === 0) return null;

    return (
        <PageSection
            title="Dienste"
            description="Ein Klick zeigt die Container des Dienstes."
            actions={
                activeProject ? (
                    <Button variant="ghost" size="sm" onClick={() => onSelectProject(null)}>
                        Filter zurücksetzen
                    </Button>
                ) : undefined
            }
        >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {groups.map((group) => {
                    const running = group.containers.filter((c) => c.status === "running").length;
                    const isActive = activeProject === group.id;

                    return (
                        <button
                            key={group.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onSelectProject(isActive ? null : group.id)}
                            className={cn(
                                "rounded-xl border bg-card p-3 text-left shadow-xs transition-colors duration-fast hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isActive && "border-primary ring-1 ring-primary",
                            )}
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[group.status])} aria-hidden />
                                <span className="truncate text-sm font-medium">{group.name}</span>
                                <span className="sr-only">Status: {SERVICE_STATUS[group.status].label}</span>
                            </div>
                            <p className="text-xs tabular-nums text-muted-foreground">
                                {running} von {group.containers.length} laufen
                            </p>
                        </button>
                    );
                })}
            </div>
        </PageSection>
    );
}
