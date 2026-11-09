import { useCreateIntent } from "@/hooks/useCreateIntent";
import { Plus } from "lucide-react";
import { useLinktreeList } from "@/api/linktree/hooks.ts";
import LinktreeTable from "@/feature/linktree/components/LinktreeTable.tsx";
import LinksProvider, { useLinksContext } from "@/feature/linktree/context/links-context.tsx";
import LinksDialogs from "@/feature/linktree/components/LinksDialogs.tsx";
import { LinktreeSummaryKpis } from "@/feature/linktree/components/LinktreeSummaryKpis.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { Button } from "@/components/ui/button.tsx";

function LinktreeContent() {
    const [linkList, setFilterData] = useLinktreeList();
    const { setOpen } = useLinksContext();
    useCreateIntent(() => setOpen('add'));
    const links = linkList.data?.links ?? [];

    return (
        <PageContainer title="Links">
            <PageHeader
                title="Links"
                description="Links deiner öffentlichen Link-Seite verwalten und Klicks auswerten."
                actions={
                    <Button onClick={() => setOpen('add')}>
                        <Plus />
                        Link anlegen
                    </Button>
                }
            />

            {linkList.error ? (
                <ErrorState title="Links konnten nicht geladen werden" error={linkList.error} onRetry={() => linkList.refetch()} />
            ) : (
                <>
                    <LinktreeSummaryKpis links={links} loading={linkList.isPending} />
                    <LinktreeTable
                        links={links}
                        maxPages={linkList.data?.totalPages}
                        loading={linkList.isPending}
                        setFilterData={setFilterData}
                    />
                </>
            )}
        </PageContainer>
    );
}

function Linktree() {
    return (
        <LinksProvider>
            <LinktreeContent />
            <LinksDialogs />
        </LinksProvider>
    );
}

export default Linktree;
