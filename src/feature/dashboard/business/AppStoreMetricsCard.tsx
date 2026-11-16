import { Link } from "react-router-dom";
import { Download, Smartphone, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EmptyState } from "@/components/feedback/empty-state.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { useAppList } from "@/api/apps/hooks.ts";

const euro = (value: number) => `${value.toLocaleString("de-DE")} €`;

export function AppStoreMetricsCard() {
    const appList = useAppList();
    const apps = (appList.data ?? []).filter((app) => app.category === "app-store");

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="space-y-1">
                    <CardTitle>App Store</CardTitle>
                    <CardDescription>Downloads und Umsatz pro App</CardDescription>
                </div>
                <Badge variant="warning">Demo</Badge>
            </CardHeader>
            <CardContent>
                {appList.isPending ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : appList.isError ? (
                    <ErrorState variant="plain" className="py-4" title="App-Store-Daten konnten nicht geladen werden" error={appList.error} onRetry={() => appList.refetch()} />
                ) : apps.length === 0 ? (
                    <EmptyState variant="plain" className="py-6" icon={Smartphone} title="Keine App-Store-Apps" description="Lege unter „Apps“ eine App mit Kategorie „App Store“ an." />
                ) : (
                    <ul className="divide-y">
                        {apps.map((app) => (
                            <li key={app.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="min-w-0">
                                    <Link to={`/dashboard/apps/${app.id}`} className="truncate text-sm font-medium hover:text-primary">
                                        {app.name}
                                    </Link>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                        {app.metrics?.downloads !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Download className="size-3" aria-hidden />
                                                <span className="sr-only">Downloads:</span>
                                                {app.metrics.downloads.toLocaleString("de-DE")}
                                            </span>
                                        )}
                                        {app.metrics?.rating !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Star className="size-3 fill-warning text-warning" aria-hidden />
                                                <span className="sr-only">Bewertung:</span>
                                                {app.metrics.rating.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">{euro(app.metrics?.revenue ?? 0)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
