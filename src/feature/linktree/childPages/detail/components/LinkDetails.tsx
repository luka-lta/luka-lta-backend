import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { TimeCell } from "@/components/TimeCell.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { LinkStatusBadge } from "@/feature/linktree/components/LinkStatusBadge.tsx";

function LinkDetails({ link }: { link: LinkItemTypeSchema }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
                <DetailList
                    items={[
                        { label: 'Status', value: <LinkStatusBadge link={link} /> },
                        {
                            label: 'Tag',
                            mono: true,
                            value: <span className="inline-flex items-center gap-1">{link.clickTag}<CopyButton value={link.clickTag} /></span>,
                        },
                        { label: 'ID', value: link.id, mono: true },
                        { label: 'Erstellt', value: <TimeCell iso={link.createdOn} full /> },
                        { label: 'Deaktiviert', value: link.deactivatedOn ? <TimeCell iso={link.deactivatedOn} full /> : null, hidden: !link.deactivated },
                    ]}
                />
            </CardContent>
        </Card>
    )
}

export default LinkDetails;
