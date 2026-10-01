import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Calendar, ExternalLink, Hash, Tag} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {TimeCell} from "@/components/TimeCell.tsx";
import {CopyButton} from "@/components/CopyButton.tsx";
import {Status, StatusIndicator, StatusLabel} from "@/components/ui/kibo-ui/status/index.tsx";

interface LinkDetailsProps {
    link: LinkItemTypeSchema;
}

function LinkDetails({ link }: LinkDetailsProps) {
    if (!link) return <p className="text-center text-red-500">No details available</p>;

    return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="truncate">{link.displayname || "Untitled Link"}</CardTitle>
                    {link.deactivated ? (
                        <Status status="maintenance" className="shrink-0">
                            <StatusIndicator/>
                            <StatusLabel>Deactivated</StatusLabel>
                        </Status>
                    ) : (
                        <Status status={link.isActive ? "online" : "offline"} className="shrink-0">
                            <StatusIndicator/>
                            <StatusLabel>{link.isActive ? "Active" : "Inactive"}</StatusLabel>
                        </Status>
                    )}
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                        <span className="text-muted-foreground">Tag:</span>
                        <span className="font-medium ml-2 truncate">{link.clickTag}</span>
                    </div>

                    <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium ml-2 truncate">{link.id}</span>
                    </div>

                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium ml-2"><TimeCell iso={link.createdOn} full/></span>
                    </div>

                    {link.url && (
                        <div className="flex items-start text-sm pt-1">
                            <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground mt-0.5 shrink-0"/>
                            <div className="flex-1 min-w-0">
                                <span className="text-muted-foreground">URL:</span>
                                <div className="font-medium mt-1 flex items-start gap-1.5">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                                       className="text-primary hover:underline break-all">
                                        {link.url}
                                    </a>
                                    <CopyButton value={link.url} className="mt-0.5 shrink-0"/>
                                </div>
                            </div>
                        </div>
                    )}

                    {link.url && (
                        <Button variant="outline" size="sm" className="w-full mt-2"
                                onClick={() => window.open(link.url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2"/>
                            Visit Link
                        </Button>
                    )}
                </CardContent>
            </Card>
    )
}

export default LinkDetails;
