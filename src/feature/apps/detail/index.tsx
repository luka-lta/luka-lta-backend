import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/api/apps/hooks";
import { getAppIcon } from "@/feature/apps/iconOptions";
import { STATUS_BADGE_CLASS, STATUS_LABELS } from "@/feature/apps/labels";
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

    if (app.isLoading) {
        return (
            <Main>
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-72 w-full rounded-xl" />
            </Main>
        );
    }

    if (app.isError || !app.data) {
        return (
            <Main>
                <Alert variant="destructive">
                    <AlertTitle>App nicht gefunden</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{app.error?.message ?? "Diese App existiert nicht."}</span>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/apps")}>
                            Zurück zur Übersicht
                        </Button>
                    </AlertDescription>
                </Alert>
            </Main>
        );
    }

    const entity = app.data;
    const Icon = getAppIcon(entity.icon);

    return (
        <Main>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">{entity.name}</h1>
                            <Badge className={cn(STATUS_BADGE_CLASS[entity.status])}>{STATUS_LABELS[entity.status]}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">App-Details, Bearbeitung und Analytics.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/dashboard/apps")}>
                        <ArrowLeft className="h-4 w-4" />
                        Zurück
                    </Button>
                    <Button variant="outline" onClick={() => setFormOpen(true)}>
                        <Pencil className="h-4 w-4" />
                        Bearbeiten
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Löschen
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="h-9">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <AppOverviewTab app={entity} />
                </TabsContent>

                <TabsContent value="analytics">
                    <AnalyticsTab app={entity} onConfigureSource={() => setFormOpen(true)} />
                </TabsContent>
            </Tabs>

            <AppFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                mode="edit"
                defaultValues={entity}
            />

            <DeleteAppDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                app={entity}
                onDeleted={() => navigate("/dashboard/apps")}
            />
        </Main>
    );
}

export default AppDetail;
