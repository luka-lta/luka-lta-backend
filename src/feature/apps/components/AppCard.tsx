import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/feedback/status-badge";
import { RowActions } from "@/components/data/row-actions";
import type { AppEntity } from "@/api/apps/schema";
import { getAppIcon } from "@/feature/apps/iconOptions";
import { CATEGORY_LABELS, formatMetricValue, getMetricEntries, METRIC_LABELS, STATUS_LABELS, STATUS_TONE } from "@/feature/apps/labels";

interface AppCardProps {
    app: AppEntity;
    onEdit: (app: AppEntity) => void;
    onDelete: (app: AppEntity) => void;
}

export function AppCard({ app, onEdit, onDelete }: AppCardProps) {
    const navigate = useNavigate();
    const Icon = getAppIcon(app.icon);
    const href = `/dashboard/apps/${app.id}`;
    const metrics = getMetricEntries(app).slice(0, 4);

    return (
        <article className="relative flex flex-col rounded-xl border bg-card shadow-xs transition-colors duration-fast hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring">
            <div className="flex items-start gap-3 p-5 pb-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold">
                        <Link to={href} className="outline-none after:absolute after:inset-0 after:rounded-xl">
                            {app.name}
                        </Link>
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{app.description || "Keine Beschreibung"}</p>
                </div>
                <RowActions
                    className="relative z-10 -mr-2 -mt-1"
                    label={app.name}
                    actions={[
                        { label: "Details", icon: Eye, onSelect: () => navigate(href) },
                        { label: "Bearbeiten", icon: Pencil, onSelect: () => onEdit(app) },
                        { label: "Öffnen", icon: ExternalLink, hidden: !app.url, onSelect: () => window.open(app.url, "_blank", "noopener") },
                        { label: "Löschen", icon: Trash2, destructive: true, onSelect: () => onDelete(app) },
                    ]}
                />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 px-5">
                <StatusBadge tone={STATUS_TONE[app.status]}>{STATUS_LABELS[app.status]}</StatusBadge>
                <Badge variant="outline">{CATEGORY_LABELS[app.category]}</Badge>
            </div>

            {metrics.length > 0 ? (
                <dl className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-3 border-t px-5 py-4">
                    {metrics.map(([key, value]) => (
                        <div key={key} className="min-w-0">
                            <dt className="text-xs text-muted-foreground">{METRIC_LABELS[key]}</dt>
                            <dd className="truncate text-sm font-semibold tabular-nums">{formatMetricValue(key, value)}</dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="mt-4 flex-1 border-t px-5 py-4 text-xs text-muted-foreground">Keine Kennzahlen hinterlegt</p>
            )}
        </article>
    );
}
