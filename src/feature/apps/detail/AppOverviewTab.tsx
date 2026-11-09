import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/data/stat-card";
import { DetailList } from "@/components/data/detail-list";
import { StatusBadge } from "@/components/feedback/status-badge";
import type { AppEntity } from "@/api/apps/schema";
import {
    ANALYTICS_SOURCE_TYPE_LABELS,
    CATEGORY_LABELS,
    formatMetricValue,
    getMetricEntries,
    METRIC_LABELS,
    STATUS_LABELS,
    STATUS_TONE,
} from "@/feature/apps/labels";

interface AppOverviewTabProps {
    app: AppEntity;
}

export function AppOverviewTab({ app }: AppOverviewTabProps) {
    const metrics = getMetricEntries(app);

    return (
        <div className="space-y-4">
            {metrics.length > 0 && (
                <StatGrid>
                    {metrics.map(([key, value]) => (
                        <StatCard key={key} label={METRIC_LABELS[key]} value={formatMetricValue(key, value)} demo />
                    ))}
                </StatGrid>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailList
                        items={[
                            { label: "Status", value: <StatusBadge tone={STATUS_TONE[app.status]}>{STATUS_LABELS[app.status]}</StatusBadge> },
                            { label: "Kategorie", value: CATEGORY_LABELS[app.category] },
                            {
                                label: "URL",
                                value: app.url ? (
                                    <a href={app.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                        <span className="break-all">{app.url}</span>
                                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                                    </a>
                                ) : null,
                            },
                            {
                                label: "Analytics-Quellen",
                                value: app.analyticsSources.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {app.analyticsSources.map((source) => (
                                            <Badge key={source.id} variant={source.enabled ? "secondary" : "outline"}>
                                                {ANALYTICS_SOURCE_TYPE_LABELS[source.type]}
                                                {!source.enabled && " (aus)"}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : null,
                            },
                            { label: "Beschreibung", value: app.description },
                        ]}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
