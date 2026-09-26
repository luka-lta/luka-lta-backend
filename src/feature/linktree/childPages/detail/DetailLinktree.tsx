import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import DetailClickChart from "@/feature/linktree/childPages/detail/components/DetailClickChart.tsx";
import {Button} from "@/components/ui/button.tsx";
import EditForm from "@/feature/linktree/childPages/detail/components/form/EditForm.tsx";
import {useLinkDetail} from "@/api/linktree/hooks.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle, ArrowLeft, ExternalLink, Power, PowerOff, Trash} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import QrCodeDisplay from "@/feature/linktree/childPages/detail/components/QrCodeDisplay.tsx";
import LinkDetails from "@/feature/linktree/childPages/detail/components/LinkDetails.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";
import {Main} from "@/components/layout/main.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/kibo-ui/status/index.tsx";
import {CopyButton} from "@/components/CopyButton.tsx";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import DeactivateLinkDialog from "@/feature/linktree/components/dialog/DeactivateLinkDialog.tsx";
import ActivateLinkDialog from "@/feature/linktree/components/dialog/ActivateLinkDialog.tsx";

function DetailLinktree() {
    const params = useParams()
    const navigate = useNavigate()
    const linkId = parseInt(params.linkId ?? '', 10)
    const [linkDetail] = useLinkDetail(linkId);
    const [openDialog, setOpenDialog] = useState<'delete' | 'deactivate' | 'activate' | null>(null);
    useSetPageTitle('Backend - Link Detail (' + linkDetail.data?.link.displayname + ')');

    if (linkDetail.error) {
        return (
            <Main>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Links</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={linkDetail}/>
                </div>
            </Main>
        )
    }

    if (linkDetail.isPending) {
        return (
            <Main>
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64"/>
                        <Skeleton className="h-4 w-40"/>
                    </div>
                    <Skeleton className="h-9 w-24"/>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-72 w-full rounded-xl"/>
                        <Skeleton className="h-72 w-full rounded-xl"/>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-56 w-full rounded-xl"/>
                        <Skeleton className="h-56 w-full rounded-xl"/>
                    </div>
                </div>
            </Main>
        )
    }

    const link = linkDetail.data?.link;

    return (
        <Main>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{link?.displayname}</h1>
                        {link && (
                            link.deactivated ? (
                                <Status status="maintenance">
                                    <StatusIndicator/>
                                    <StatusLabel>Deactivated</StatusLabel>
                                </Status>
                            ) : (
                                <Status status={link.isActive ? "online" : "offline"}>
                                    <StatusIndicator/>
                                    <StatusLabel>{link.isActive ? "Active" : "Inactive"}</StatusLabel>
                                </Status>
                            )
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">Link details, editing and click history.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/dashboard/linktree')}>
                        <ArrowLeft className="h-4 w-4"/>
                        Back
                    </Button>
                    {link?.url && (
                        <Button variant="outline" onClick={() => window.open(link.url, "_blank")}>
                            <ExternalLink className="h-4 w-4"/>
                            Visit
                        </Button>
                    )}
                    {link?.url && <CopyButton value={link.url}/>}
                    {link && (link.deactivated ? (
                        <Button variant="outline" onClick={() => setOpenDialog('activate')}>
                            <Power className="h-4 w-4"/>
                            Activate
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setOpenDialog('deactivate')}>
                            <PowerOff className="h-4 w-4"/>
                            Deactivate
                        </Button>
                    ))}
                    <Button variant="destructive" onClick={() => setOpenDialog('delete')}>
                        <Trash className="h-4 w-4"/>
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="h-9">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-4 lg:grid-cols-3 items-start">
                        <div className="lg:col-span-2">
                            <EditForm initialData={link}/>
                        </div>
                        <div className="space-y-4">
                            <LinkDetails link={link!}/>
                            <QrCodeDisplay link={link?.url ?? ''}/>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <DetailClickChart/>
                </TabsContent>
            </Tabs>

            {link && (
                <>
                    <DeleteLinkDialog
                        open={openDialog === 'delete'}
                        onOpenChange={(open) => {
                            setOpenDialog(open ? 'delete' : null);
                            if (!open) navigate('/dashboard/linktree');
                        }}
                        currentRow={link}
                    />
                    <DeactivateLinkDialog
                        open={openDialog === 'deactivate'}
                        onOpenChange={(open) => setOpenDialog(open ? 'deactivate' : null)}
                        currentRow={link}
                    />
                    <ActivateLinkDialog
                        open={openDialog === 'activate'}
                        onOpenChange={(open) => setOpenDialog(open ? 'activate' : null)}
                        currentRow={link}
                    />
                </>
            )}
        </Main>
    );
}

export default DetailLinktree;
