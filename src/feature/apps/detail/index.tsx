import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatusBadge } from "@/components/feedback/status-badge";
import { ErrorState } from "@/components/feedback/error-state";
import { DetailPageSkeleton } from "@/components/feedback/loading-state";
import { RowActions } from "@/components/data/row-actions";
import { useApp } from "@/api/apps/hooks";
import { getAppIcon } from "@/feature/apps/iconOptions";
import { STATUS_LABELS, STATUS_TONE } from "@/feature/apps/labels";
import { AppFormDialog } from "@/feature/apps/components/AppFormDialog";
import { DeleteAppDialog } from "@/feature/apps/components/DeleteAppDialog";
import { AppOverviewTab } from "@/feature/apps/detail/AppOverviewTab";
import { AnalyticsTab } from "@/feature/apps/detail/AnalyticsTab";

function AppDetail() {
    const { appId } = useParams();
    const navigate = useNavigate();
    const app = useApp(appId ?? "");
    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const back = { to: "/dashboard/apps", label: "Apps" };

    if (app.isPending) {
        return (
            <PageContainer title="App">
                <DetailPageSkeleton />
            </PageContainer>
        );
    }

    if (app.isError || !app.data) {
        return (
            <PageContainer title="App">
                <PageHeader back={back} title="App" />
                <ErrorState
                    title="App nicht gefunden"
                    error={app.error ?? undefined}
                    message={app.error ? undefined : "Diese App gibt es nicht (mehr)."}
                    action={<Button variant="outline" onClick={() => navigate(back.to)}>Zur Übersicht</Button>}
                />
            </PageContainer>
        );
    }

    const entity = app.data;
    const Icon = getAppIcon(entity.icon);

    return (
        <PageContainer title={entity.name}>
            <PageHeader
                back={back}
                title={entity.name}
                description={entity.description || undefined}
                media={
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5" aria-hidden />
                    </div>
                }
                meta={
                    <>
                        <StatusBadge tone={STATUS_TONE[entity.status]}>{STATUS_LABELS[entity.status]}</StatusBadge>
                        <Badge variant="warning">Demo</Badge>
                    </>
                }
                actions={
                    <>
                        {entity.url && (
                            <Button variant="outline" asChild>
                                <a href={entity.url} target="_blank" rel="noreferrer">
                                    <ExternalLink />
                                    Öffnen
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setFormOpen(true)}>
                            <Pencil />
                            Bearbeiten
                        </Button>
                        <RowActions
                            className="size-9"
                            label={entity.name}
                            actions={[{ label: "Löschen", icon: Trash2, destructive: true, onSelect: () => setDeleteOpen(true) }]}
                        />
                    </>
                }
            />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-0">
                    <AppOverviewTab app={entity} />
                </TabsContent>
                <TabsContent value="analytics" className="mt-0">
                    <AnalyticsTab app={entity} onConfigureSource={() => setFormOpen(true)} />
                </TabsContent>
            </Tabs>

            <AppFormDialog open={formOpen} onOpenChange={setFormOpen} mode="edit" defaultValues={entity} />

            <DeleteAppDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                app={entity}
                onDeleted={() => navigate(back.to)}
            />
        </PageContainer>
    );
}

export default AppDetail;
