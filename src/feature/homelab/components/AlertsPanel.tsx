import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { CircleAlert, Info, OctagonAlert, ShieldCheck } from "lucide-react";
import type { Alert, AlertSeverity } from "@/feature/homelab/types.ts";
import { cn } from "@/lib/utils.ts";

interface AlertsPanelProps {
    alerts: Alert[];
}

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: typeof CircleAlert; className: string; label: string }> = {
    critical: { icon: OctagonAlert, className: "text-rose-500 bg-rose-500/10", label: "Critical" },
    warning: { icon: CircleAlert, className: "text-amber-500 bg-amber-500/10", label: "Warning" },
    info: { icon: Info, className: "text-sky-500 bg-sky-500/10", label: "Info" },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
    const sorted = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Alerts & problems</CardTitle>
            </CardHeader>
            <CardContent>
                {sorted.length === 0 ? (
                    <Empty className="border-0 py-8">
                        <EmptyMedia variant="icon">
                            <ShieldCheck />
                        </EmptyMedia>
                        <EmptyTitle>No active alerts</EmptyTitle>
                    </Empty>
                ) : (
                    <ul className="space-y-1">
                        {sorted.map((alert) => {
                            const config = SEVERITY_CONFIG[alert.severity];
                            const Icon = config.icon;
                            return (
                                <li key={alert.id} className="flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors">
                                    <div className={cn("rounded-md p-1.5 shrink-0", config.className)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{alert.title}</p>
                                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                                    </div>
                                    <TimeCell iso={alert.timestamp} />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
