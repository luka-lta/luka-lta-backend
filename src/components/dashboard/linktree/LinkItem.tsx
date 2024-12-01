import {LinkItemType} from "@/lib/types/LinkItemType.ts";
import * as Icons from "react-icons/fa";
import {ExternalLink, GripVertical, MoreHorizontal, Pencil, Trash} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import {MdError} from "react-icons/md";

interface LinksTableRowProps {
    link: LinkItemType
    onDelete: () => void
    onEdit: () => void
}

function LinkItem({link, onDelete, onEdit}: LinksTableRowProps) {
    const CustomFaIcon = ({name}) => {
        const FaIcon = Icons[name];
        if (!FaIcon) return <MdError className="text-red-500">Icon not found!</MdError>;

        return <FaIcon/>;
    };

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <button
                    className="touch-none p-2 hover:cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground"/>
                    <span className="sr-only">Drag handle</span>
                </button>

                <div>
                    <div className="flex items-center font-medium gap-2">
                        <Avatar>
                            <AvatarFallback><CustomFaIcon name={link.iconName}/></AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">|</span>
                        <span>{link.displayname}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{link.url}</div>
                    {link.description && (
                        <div className="text-sm text-muted-foreground">{link.description}</div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4"/>
                        <span className="sr-only">Open {link.displayname}</span>
                    </a>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4"/>
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash className="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default LinkItem;