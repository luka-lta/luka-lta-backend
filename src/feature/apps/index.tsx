import { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { CardGridSkeleton } from "@/components/feedback/loading-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { useAppList } from "@/api/apps/hooks";
import type { AppEntity } from "@/api/apps/schema";
import { AppCard } from "@/feature/apps/components/AppCard";
import { AppFormDialog } from "@/feature/apps/components/AppFormDialog";
import { DeleteAppDialog } from "@/feature/apps/components/DeleteAppDialog";

function Apps() {
    const appList = useAppList();
    const [formState, setFormState] = useState<{ mode: "create" | "edit"; app?: AppEntity } | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [appToDelete, setAppToDelete] = useState<AppEntity | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const apps = appList.data ?? [];
    const openCreate = () => {
        setFormState({ mode: "create" });
        setFormOpen(true);
    };

    return (
        <PageContainer title="Apps">
            <PageHeader
                title="Apps"
                meta={<Badge variant="warning">Demo</Badge>}
                description="Apps, Webseiten und Produkte an einem Ort. Die Registry läuft noch gegen lokale Beispieldaten – Änderungen gehen beim Neuladen verloren."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        App anlegen
                    </Button>
                }
            />

            {appList.isPending ? (
                <CardGridSkeleton count={3} className="lg:grid-cols-3" itemClassName="h-52" />
            ) : appList.isError ? (
                <ErrorState title="Apps konnten nicht geladen werden" error={appList.error} onRetry={() => appList.refetch()} />
            ) : apps.length === 0 ? (
                <EmptyState
                    icon={Boxes}
                    title="Noch keine Apps"
                    description="Lege deine erste App an – z. B. eine App-Store-App, eine Kundenwebseite oder ein SaaS-Produkt."
                    action={<Button variant="outline" size="sm" onClick={openCreate}>App anlegen</Button>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <AppCard
                            key={app.id}
                            app={app}
                            onEdit={(a) => { setFormState({ mode: "edit", app: a }); setFormOpen(true); }}
                            onDelete={(a) => { setAppToDelete(a); setDeleteOpen(true); }}
                        />
                    ))}
                </div>
            )}

            {formState && (
                <AppFormDialog
                    open={formOpen}
                    onOpenChange={(open) => {
                        setFormOpen(open);
                        if (!open) setTimeout(() => setFormState(null), 300);
                    }}
                    mode={formState.mode}
                    defaultValues={formState.app}
                />
            )}

            {appToDelete && (
                <DeleteAppDialog
                    open={deleteOpen}
                    onOpenChange={(open) => {
                        setDeleteOpen(open);
                        if (!open) setTimeout(() => setAppToDelete(null), 300);
                    }}
                    app={appToDelete}
                />
            )}
        </PageContainer>
    );
}

export default Apps;
