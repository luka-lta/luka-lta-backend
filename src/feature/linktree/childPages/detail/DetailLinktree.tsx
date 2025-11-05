import {useParams} from "react-router-dom";
import DetailClickChart from "@/feature/linktree/childPages/detail/components/DetailClickChart.tsx";
import {Button} from "@/components/ui/button.tsx";
import EditForm from "@/feature/linktree/childPages/detail/components/form/EditForm.tsx";
import {useLinkDetail} from "@/feature/linktree/childPages/detail/hooks/useLink.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {AlertTriangle} from "lucide-react";
import {QueryErrorDisplay} from "@/components/QueryErrorDisplay.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import QrCodeDisplay from "@/feature/linktree/childPages/detail/components/QrCodeDisplay.tsx";
import LinkDetails from "@/feature/linktree/childPages/detail/components/LinkDetails.tsx";
import {useSetPageTitle} from "@/hooks/useSetPageTitle.ts";

function DetailLinktree() {
    const params = useParams()
    const linkId: number = params.linkId as unknown as number
    const [linkDetail] = useLinkDetail(linkId);
    useSetPageTitle('Backend - Link Detail (' + linkDetail.data?.link.displayname + ')');

    if (linkDetail.error) {
        return (
            <div className='p-6'>
                <div className='mb-5'>
                    <div className='flex items-center gap-2 mb-2'>
                        <h1 className='text-2xl font-semibold'>Links</h1>
                        <Badge variant='secondary' className='bg-zinc-900 text-red-600 hover:bg-zinc-900'>
                            <AlertTriangle/>
                        </Badge>
                    </div>
                    <QueryErrorDisplay query={linkDetail}/>
                </div>
            </div>
        )
    }

    if (linkDetail.isPending) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <h1 className="text-2xl">Informations</h1>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="aspect-video rounded-xl bg-muted/50 p-4">
                            <Skeleton className="h-4 w-32 mb-4"/>
                            <Skeleton className="h-20 w-full"/>
                        </div>
                    ))}
                </div>
                <Skeleton className="h-8 w-32 mt-4"/>
                <Skeleton className="h-[50vh] w-full rounded-xl"/>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl">Informations</h1>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50">
                    <LinkDetails link={linkDetail.data?.link}/>
                </div>

                <div className="aspect-video rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-500">Edit</h2>
                    </div>
                    <EditForm
                        initialData={linkDetail.data?.link}
                    />
                </div>

                <div className="aspect-video rounded-xl bg-muted/50">
                    <QrCodeDisplay
                        link={linkDetail.data?.link.url}
                    />
                </div>
            </div>

            <h1>Clicks</h1>
            <p className="text-muted-foreground">Shows the current clicks from other Persons</p>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <DetailClickChart/>
            </div>

            <Button variant="secondary" onClick={() => window.history.back()} className="mt-4">
                Back
            </Button>
        </div>
    );
}

export default DetailLinktree;