import { useState } from "react";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { useAppList } from "@/api/apps/hooks";
import type { AppEntity } from "@/api/apps/schema";
import { AppCard } from "@/feature/apps/components/AppCard";
import { EmptyAppsState } from "@/feature/apps/components/EmptyAppsState";
import { AppFormDialog } from "@/feature/apps/components/AppFormDialog";
import { DeleteAppDialog } from "@/feature/apps/components/DeleteAppDialog";

function Apps() {
    const appList = useAppList();
    const [formState, setFormState] = useState<{ mode: "create" | "edit"; app?: AppEntity } | null>(null);
    const [appToDelete, setAppToDelete] = useState<AppEntity | null>(null);

    const apps = appList.data ?? [];

    return (
        <Main>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
                    <p className="text-muted-foreground">Verwalte alle Apps, Webseiten und Produkte an einem Ort.</p>
                </div>
                {apps.length > 0 && (
                    <Button onClick={() => setFormState({ mode: "create" })}>
                        <Plus className="h-4 w-4" />
                        Neue App
                    </Button>
                )}
            </div>

            {appList.isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-lg" />
                    ))}
                </div>
            )}

            {appList.isError && (
                <Alert variant="destructive">
                    <AlertTitle>Apps konnten nicht geladen werden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{appList.error.message}</span>
                        <Button variant="outline" size="sm" onClick={() => appList.refetch()}>
                            Erneut versuchen
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {!appList.isLoading && !appList.isError && apps.length === 0 && (
                <EmptyAppsState onCreate={() => setFormState({ mode: "create" })} />
            )}

            {!appList.isLoading && !appList.isError && apps.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onEdit={(a) => setFormState({ mode: "edit", app: a })}
                            onDelete={(a) => setAppToDelete(a)}
                        />
                    ))}
                </div>
            )}

            {formState && (
                <AppFormDialog
                    open={!!formState}
                    onOpenChange={(open) => !open && setFormState(null)}
                    mode={formState.mode}
                    defaultValues={formState.app}
                />
            )}

            {appToDelete && (
                <DeleteAppDialog
                    open={!!appToDelete}
                    onOpenChange={(open) => !open && setAppToDelete(null)}
                    app={appToDelete}
                />
            )}
        </Main>
    );
}

export default Apps;
