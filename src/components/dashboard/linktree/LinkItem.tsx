import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {GripVertical, Pencil, Trash} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {Link} from "react-router-dom";
import {Badge, badgeVariants} from "@/components/ui/badge.tsx";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {formatDate} from "@/lib/utils.ts";
import CustomFaIcon from "@/components/CustomFaIcon.tsx";
import {useCallback} from "react";

interface LinkItemProps {
    link: LinkItemTypeSchema;
    onDelete: () => void;
    onEdit: () => void;
}

function LinkItem({link, onDelete, onEdit}: LinkItemProps) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: link.id});
    const badgeVariant = link.isActive ? "default" : "destructive";

    const handleDelete = useCallback(onDelete, [onDelete]);
    const handleEdit = useCallback(onEdit, [onEdit]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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
                            {/* @ts-ignore */}
                            <CustomFaIcon name={link.iconName ?? undefined}/>
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
                    <Badge className={badgeVariants({variant: badgeVariant})}>
                        {link.isActive ? "Active" : "Inactive"}
                    </Badge>
                </TableCell>
                <TableCell>
                    {formatDate(link.createdOn)}
                </TableCell>
                <TableCell>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="mr-2" onClick={handleEdit}>
                                <Pencil/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                            Edit
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="destructive" onClick={handleDelete}>
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
