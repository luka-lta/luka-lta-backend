import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { AppEntity } from "@/api/apps/schema";
import { getAppIcon } from "@/feature/apps/iconOptions";
import { CATEGORY_LABELS, METRIC_LABELS, STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";

interface AppCardProps {
    app: AppEntity;
    onEdit: (app: AppEntity) => void;
    onDelete: (app: AppEntity) => void;
}

function formatMetricValue(key: keyof NonNullable<AppEntity["metrics"]>, value: number): string {
    if (key === "revenue" || key === "mrr") return `${value.toLocaleString("de-DE")} €`;
    if (key === "rating") return value.toFixed(1);
    if (key === "churnPercent") return `${value}%`;
    return value.toLocaleString("de-DE");
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
    const Icon = getAppIcon(app.icon);
    const metricEntries = app.metrics
        ? (Object.entries(app.metrics) as [keyof NonNullable<AppEntity["metrics"]>, number | undefined][])
            .filter((entry): entry is [keyof NonNullable<AppEntity["metrics"]>, number] => entry[1] !== undefined)
        : [];

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
                <Link to={`/dashboard/apps/${app.id}`} className="flex items-start gap-3 min-w-0 hover:opacity-80">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold truncate">{app.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
                    <Badge className={cn(STATUS_BADGE_CLASS[app.status])}>{STATUS_LABELS[app.status]}</Badge>
                </div>
                {metricEntries.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {metricEntries.map(([key, value]) => (
                            <div key={key}>
                                <p className="text-muted-foreground text-xs">{METRIC_LABELS[key]}</p>
                                <p className="font-medium tabular-nums">{formatMetricValue(key, value)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                {app.url ? (
                    <a
                        href={app.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Öffnen
                    </a>
                ) : (
                    <span />
                )}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(app)} aria-label={`${app.name} bearbeiten`}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(app)} aria-label={`${app.name} löschen`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
