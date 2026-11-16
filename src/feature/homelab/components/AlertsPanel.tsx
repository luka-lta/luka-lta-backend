import { CircleAlert, Info, OctagonAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import type { Alert, AlertSeverity } from "@/feature/homelab/types.ts";
import { ALERT_SEVERITY } from "@/feature/homelab/status.ts";
import { cn } from "@/lib/utils.ts";
import { parseSqlUtc } from "@/lib/dateTimeUtils.ts";

interface AlertsPanelProps {
    alerts: Alert[];
}

const SEVERITY_ICON: Record<AlertSeverity, { icon: typeof CircleAlert; className: string }> = {
    critical: { icon: OctagonAlert, className: "bg-destructive/10 text-destructive" },
    warning: { icon: CircleAlert, className: "bg-warning/10 text-warning" },
    info: { icon: Info, className: "bg-info/10 text-info" },
};

const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function AlertsPanel({ alerts }: AlertsPanelProps) {
    const sorted = [...alerts].sort(
        (a, b) =>
            SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
            parseSqlUtc(b.timestamp).toMillis() - parseSqlUtc(a.timestamp).toMillis(),
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Warnungen</CardTitle>
                {sorted.length > 0 && <Badge variant="neutral">{sorted.length}</Badge>}
            </CardHeader>
            <CardContent>
                {sorted.length === 0 ? (
                    <EmptyState variant="plain" className="py-8" icon={ShieldCheck} title="Keine offenen Warnungen" />
                ) : (
                    <ul className="divide-y">
                        {sorted.map((alert) => {
                            const config = SEVERITY_ICON[alert.severity];
                            const Icon = config.icon;
                            return (
                                <li key={alert.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", config.className)}>
                                        <Icon className="size-4" aria-hidden />
                                        <span className="sr-only">{ALERT_SEVERITY[alert.severity].label}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
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
