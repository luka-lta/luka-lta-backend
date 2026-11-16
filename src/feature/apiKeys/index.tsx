import { useCreateIntent } from "@/hooks/useCreateIntent";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useApiKeys } from "@/api/apiKeys/hooks.ts";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";
import ApiKeyTable from "@/feature/apiKeys/components/ApiKeyTable.tsx";
import CreateApiKeyDialog from "@/feature/apiKeys/components/CreateApiKeyDialog.tsx";
import DeleteApiKeyDialog from "@/feature/apiKeys/components/DeleteApiKeyDialog.tsx";

function ApiKeys() {
    const apiKeys = useApiKeys();
    const [createOpen, setCreateOpen] = useState(false);
    useCreateIntent(() => setCreateOpen(true));
    const [deleteTarget, setDeleteTarget] = useState<ApiKeyType | null>(null);

    return (
        <PageContainer title="API-Keys">
            <PageHeader
                title="API-Keys"
                description="Schlüssel für Agents und Integrationen (z. B. den Homelab-Collector) mit eingeschränkten Berechtigungen."
                actions={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus />
                        API-Key erstellen
                    </Button>
                }
            />

            {apiKeys.error ? (
                <ErrorState title="API-Keys konnten nicht geladen werden" error={apiKeys.error} onRetry={() => apiKeys.refetch()} />
            ) : (
                <ApiKeyTable
                    apiKeys={apiKeys.data ?? []}
                    loading={apiKeys.isPending}
                    onDelete={setDeleteTarget}
                    onCreate={() => setCreateOpen(true)}
                />
            )}

            <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />

            {deleteTarget && (
                <DeleteApiKeyDialog
                    open
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    currentRow={deleteTarget}
                />
            )}
        </PageContainer>
    );
}

export default ApiKeys;
