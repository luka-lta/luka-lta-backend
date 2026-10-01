import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Star, Download } from "lucide-react";
import { useAppList } from "@/api/apps/hooks.ts";

function formatEuro(value: number): string {
    return `${value.toLocaleString("de-DE")} €`;
}

export function AppStoreMetricsCard() {
    const appList = useAppList();
    const apps = (appList.data ?? []).filter((app) => app.category === "app-store");

    return (
        <Card>
            <CardHeader>
                <CardTitle>App Store Metrics</CardTitle>
                <CardDescription>Downloads & Revenue pro App</CardDescription>
            </CardHeader>
            <CardContent>
                {appList.isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : appList.isError ? (
                    <p className="text-sm text-destructive">
                        App-Store-Metriken konnten nicht geladen werden.
                    </p>
                ) : apps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Noch keine App-Store-Apps angelegt. Füge welche unter „Apps" hinzu.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {apps.map((app) => (
                            <li key={app.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{app.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                        {app.metrics?.downloads !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Download className="h-3.5 w-3.5" />
                                                {app.metrics.downloads.toLocaleString("de-DE")}
                                            </span>
                                        )}
                                        {app.metrics?.rating !== undefined && (
                                            <span className="flex items-center gap-1">
                                                <Star className="h-3.5 w-3.5 text-amber-500" />
                                                {app.metrics.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-medium tabular-nums">
                                    {formatEuro(app.metrics?.revenue ?? 0)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
