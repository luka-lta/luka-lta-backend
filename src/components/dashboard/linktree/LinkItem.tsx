import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {GripVertical, Pencil, Trash} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import * as Icons from "react-icons/fa";
import {MdError} from "react-icons/md";
import {Link} from "react-router-dom";
import {Badge, badgeVariants} from "@/components/ui/badge.tsx";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface LinkItemProps {
    link: LinkItemTypeSchema;
    onDelete: () => void;
    onEdit: () => void;
}

function LinkItem({link, onDelete, onEdit}: LinkItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: link.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const CustomFaIcon = ({name}: { name: keyof typeof Icons | null }) => {
        if (!name) {
            return <MdError className="text-red-500" title="Icon not found!">?</MdError>;
        }

        const FaIcon = Icons[name];
        if (!FaIcon) {
            return <MdError className="text-red-500" title="Invalid Icon!">?</MdError>;
        }

        return <FaIcon/>;
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <TooltipProvider>
                <TableCell className="flex items-center space-x-2">
                    <GripVertical {...listeners} className="cursor-grab text-muted-foreground hover:text-blue-500"/>
                    <Avatar>
                        <AvatarFallback>
                            <CustomFaIcon name={link.iconName}/>
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">|</span>
                    <span>{link.displayname}</span>
                </TableCell>
                <TableCell>
                    {link.description || "[No description]"}
                </TableCell>
                <TableCell>
                    <Link
                        to={link.url}
                        className="text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                        {link.url}
                    </Link>
                </TableCell>
                <TableCell>
                    <Badge className={badgeVariants({variant: link.isActive ? "default" : "destructive"})}>
                        {link.isActive ? "Active" : "Inactive"}
                    </Badge>
                </TableCell>
                <TableCell>
                    {Date.parse(link.createdOn)
                        ? new Intl.DateTimeFormat("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hourCycle: "h23",
                        }).format(new Date(link.createdOn))
                        : "Unknown"}
                </TableCell>
                <TableCell>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="mr-2" onClick={onEdit}>
                                <Pencil/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                            Edit
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" onClick={onDelete}>
                                <Trash/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                            Delete
                        </TooltipContent>
                    </Tooltip>
                </TableCell>
            </TooltipProvider>
        </TableRow>
    );
}

export default LinkItem;
