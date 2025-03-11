import { LinkItemTypeSchema } from "@/feature/linktree/schema/LinktreeSchema.ts";
import {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider} from "@/components/ui/tooltip";
import {Badge} from "@/components/ui/badge.tsx";
import {Calendar, Clock, ExternalLink, Hash} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

interface LinkDetailsProps {
    link: LinkItemTypeSchema;
}

function LinkDetails({ link }: LinkDetailsProps) {
    if (!link) return <p className="text-center text-red-500">No details available</p>;

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
        return `${Math.floor(diffInSeconds / 31536000)} years ago`
    }

    return (
        <TooltipProvider>
            <div className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold truncate">{link.displayname || "Untitled Link"}</h2>
                    {/*{  TODO: Eventuell grün und rot machen }*/}
                    <Badge variant={link.isActive ? "default" : "destructive"} className="ml-2">
                        {link.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <div className="space-y-3 flex-1">
                    <div className="flex items-center text-sm">
                        <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium ml-2 truncate">{link.id}</span>
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium ml-2">{getTimeAgo(link.createdOn)}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {new Date(link.createdOn).toLocaleString()}
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    {link.url && (
                        <div className="flex items-start text-sm mt-4">
                            <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <span className="text-muted-foreground">URL:</span>
                                <div className="font-medium mt-1 break-all">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {link.url}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {link.url && (
                    <div className="mt-auto pt-4">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(link.url, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Link
                        </Button>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}

export default LinkDetails;
