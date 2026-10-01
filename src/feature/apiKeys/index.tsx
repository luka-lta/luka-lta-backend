import { useState } from "react";
import { Main } from "@/components/layout/main.tsx";
import { useSetPageTitle } from "@/hooks/useSetPageTitle.ts";
import { ErrorState } from "@/components/error-state.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useApiKeys } from "@/api/apiKeys/hooks.ts";
import { ApiKeyType } from "@/api/apiKeys/schema.ts";
import ApiKeyTable from "@/feature/apiKeys/components/ApiKeyTable.tsx";
import CreateApiKeyDialog from "@/feature/apiKeys/components/CreateApiKeyDialog.tsx";
import DeleteApiKeyDialog from "@/feature/apiKeys/components/DeleteApiKeyDialog.tsx";

function ApiKeys() {
    useSetPageTitle("Backend - API Keys");

    const apiKeys = useApiKeys();
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ApiKeyType | null>(null);

    if (apiKeys.error) {
        return (
            <Main>
                <h2 className="text-2xl font-bold tracking-tight mb-4">API Keys</h2>
                <ErrorState
                    title="Failed to load API keys"
                    message={apiKeys.error.message}
                    refetch={apiKeys.refetch}
                />
            </Main>
        );
    }

    return (
        <Main>
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
                    <p className="text-muted-foreground">
                        Keys for agents and integrations (e.g. the homelab collector) with scoped permissions.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create API Key
                </Button>
            </div>

            <ApiKeyTable
                apiKeys={apiKeys.data ?? []}
                loading={apiKeys.isPending}
                onDelete={setDeleteTarget}
            />

            <CreateApiKeyDialog open={createOpen} onOpenChange={setCreateOpen} />

            {deleteTarget && (
                <DeleteApiKeyDialog
                    open={deleteTarget !== null}
                    onOpenChange={(open) => {
                        if (!open) setDeleteTarget(null);
                    }}
                    currentRow={deleteTarget}
                />
            )}
        </Main>
    );
}

export default ApiKeys;
