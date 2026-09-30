import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppEntity } from "@/api/apps/schema";
import { ANALYTICS_SOURCE_LABELS, CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";

interface AppOverviewTabProps {
    app: AppEntity;
}

function formatMetricValue(key: keyof NonNullable<AppEntity["metrics"]>, value: number): string {
    if (key === "revenue" || key === "mrr") return `${value.toLocaleString("de-DE")} €`;
    if (key === "rating") return value.toFixed(1);
    if (key === "churnPercent") return `${value}%`;
    return value.toLocaleString("de-DE");
}

export function AppOverviewTab({ app }: AppOverviewTabProps) {
    const metricEntries = app.metrics
        ? (Object.entries(app.metrics) as [keyof NonNullable<AppEntity["metrics"]>, number | undefined][])
            .filter((entry): entry is [keyof NonNullable<AppEntity["metrics"]>, number] => entry[1] !== undefined)
        : [];

    return (
        <Card>
            <CardContent className="space-y-6 p-6">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Beschreibung</p>
                    <p>{app.description || "Keine Beschreibung hinterlegt."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                    <Badge variant="outline">Analytics: {ANALYTICS_SOURCE_LABELS[app.analyticsSource]}</Badge>
                </div>

                {app.url && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">URL</p>
                        <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {app.url}
                        </a>
                    </div>
                )}

                {metricEntries.length > 0 && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Metriken</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {metricEntries.map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-muted-foreground text-xs">{METRIC_LABELS[key]}</p>
                                    <p className="font-medium tabular-nums">{formatMetricValue(key, value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
