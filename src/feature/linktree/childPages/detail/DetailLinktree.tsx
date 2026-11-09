import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Power, PowerOff, Trash2 } from "lucide-react";
import DetailClickChart from "@/feature/linktree/childPages/detail/components/DetailClickChart.tsx";
import EditForm from "@/feature/linktree/childPages/detail/components/form/EditForm.tsx";
import QrCodeDisplay from "@/feature/linktree/childPages/detail/components/QrCodeDisplay.tsx";
import LinkDetails from "@/feature/linktree/childPages/detail/components/LinkDetails.tsx";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import DeactivateLinkDialog from "@/feature/linktree/components/dialog/DeactivateLinkDialog.tsx";
import { LinkStatusBadge } from "@/feature/linktree/components/LinkStatusBadge.tsx";
import { useReactivateLink } from "@/feature/linktree/components/useToggleLinkActivation.ts";
import { useLinkDetail } from "@/api/linktree/hooks.ts";
import { Button } from "@/components/ui/button.tsx";
import { LinkIcon } from "@/components/LinkIcon.tsx";
import { PageContainer, PageHeader } from "@/components/layout/page.tsx";
import { ErrorState } from "@/components/feedback/error-state.tsx";
import { DetailPageSkeleton } from "@/components/feedback/loading-state.tsx";
import { RowActions } from "@/components/data/row-actions.tsx";

const BACK = { to: '/dashboard/linktree', label: 'Alle Links' };

function DetailLinktree() {
    const params = useParams();
    const navigate = useNavigate();
    const linkId = parseInt(params.linkId ?? '', 10);
    const [linkDetail] = useLinkDetail(linkId);
    const [openDialog, setOpenDialog] = useState<'delete' | 'deactivate' | null>(null);
    const reactivate = useReactivateLink();
    const link = linkDetail.data?.link;

    if (linkDetail.isPending) {
        return (
            <PageContainer title="Link">
                <DetailPageSkeleton />
            </PageContainer>
        );
    }

    if (linkDetail.error || !link) {
        return (
            <PageContainer title="Link nicht gefunden">
                <PageHeader title="Link" back={BACK} />
                <ErrorState
                    title="Link konnte nicht geladen werden"
                    error={linkDetail.error}
                    message={linkDetail.error ? undefined : 'Diesen Link gibt es nicht (mehr).'}
                    onRetry={() => linkDetail.refetch()}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer title={link.displayname}>
            <PageHeader
                back={BACK}
                title={link.displayname}
                meta={<LinkStatusBadge link={link} />}
                description={link.url}
                media={
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-card">
                        <LinkIcon name={link.iconName} className="size-5" />
                    </div>
                }
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                Öffnen
                            </a>
                        </Button>
                        {link.deactivated ? (
                            <Button variant="outline" onClick={() => reactivate(link)}>
                                <Power />
                                Aktivieren
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => setOpenDialog('deactivate')}>
                                <PowerOff />
                                Deaktivieren
                            </Button>
                        )}
                        <RowActions
                            label={link.displayname}
                            className="size-9 border bg-card shadow-xs"
                            actions={[{ label: 'Link löschen', icon: Trash2, destructive: true, onSelect: () => setOpenDialog('delete') }]}
                        />
                    </>
                }
            />

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <EditForm key={link.id} initialData={link} />
                    <DetailClickChart displayname={link.displayname} />
                </div>
                <div className="space-y-6">
                    <LinkDetails link={link} />
                    <QrCodeDisplay link={link.url} />
                </div>
            </div>

            <DeleteLinkDialog
                open={openDialog === 'delete'}
                onOpenChange={(open) => setOpenDialog(open ? 'delete' : null)}
                onDeleted={() => navigate('/dashboard/linktree')}
                currentRow={link}
            />
            <DeactivateLinkDialog
                open={openDialog === 'deactivate'}
                onOpenChange={(open) => setOpenDialog(open ? 'deactivate' : null)}
                currentRow={link}
            />
        </PageContainer>
    );
}

export default DetailLinktree;
