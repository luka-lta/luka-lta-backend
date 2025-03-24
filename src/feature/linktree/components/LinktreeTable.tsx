import {DataTable} from "@/components/dataTable/DataTable.tsx";
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {TableCell, TableRow} from "@/components/ui/table.tsx";
import {EllipsisVertical, Pencil, Trash} from "lucide-react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar.tsx";
import CustomFaIcon from "@/components/CustomFaIcon.tsx";
import {Link, useNavigate} from "react-router-dom";
import {Badge} from "@/components/ui/badge.tsx";
import {cn, formatDate} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {CreateLinkDialog} from "@/feature/linktree/components/dialog/CreateLinkDialog.tsx";
import EditLinkDialog from "@/feature/linktree/components/dialog/EditLinkDialog.tsx";
import DeleteLinkDialog from "@/feature/linktree/components/dialog/DeleteLinkDialog.tsx";
import {SearchFilter} from "@/components/dataTable/filter/SearchFilter.tsx";

interface LinktreeTableProps {
    links: LinkItemTypeSchema[];
    maxPages: number;
    loading: boolean;
    setFilterData: (filterData: Record<string, string>) => void;
}

function LinktreeTable({links, maxPages, loading, setFilterData}: LinktreeTableProps) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [newLink, setNewLink] = useState(false);
    const [editLink, setEditLink] = useState<null | LinkItemTypeSchema>(null);
    const [deleteLink, setDeleteLink] = useState<null | number>(null);

    return (
        <>
            {(editLink !== null) && (
                <EditLinkDialog link={editLink} onClose={() => setEditLink(null)}/>
            )}

            {(deleteLink !== null) && (
                <DeleteLinkDialog onClose={() => setDeleteLink(null)} linkId={deleteLink}/>
            )}

            {newLink && (
                <CreateLinkDialog onClose={() => setNewLink(false)}/>
            )}

            <div className='px-6'>
                <DataTable
                    data={links}
                    header={[
                        {label: 'Click Tag'},
                        {label: 'Display Name', sortName: 'displayname'},
                        {label: 'Description'},
                        {label: 'URL'},
                        {label: 'Status', sortName: 'is_active'},
                        {label: 'Created At', sortName: 'created_at'},
                        {label: ''}
                    ]}
                    maxPages={maxPages}
                    renderRow={(link) => {
                        return (
                            <TableRow key={link.id} onClick={() => navigate(`/dashboard/linktree/${link.id}`)}>
                                <TooltipProvider>
                                    <TableCell>
                                        {link.clickTag.toUpperCase()}
                                    </TableCell>
                                    <TableCell className="flex items-center space-x-2">
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
                                        <Badge variant={"default"} className={cn("ml-2 bg-red-500 text-white", link.isActive && "bg-green-500 text-black")}>
                                            {link.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(link.createdOn)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant={'ghost'}><EllipsisVertical/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={(event) => {
                                                    event.stopPropagation();
                                                    setEditLink(link)
                                                }
                                                }>
                                                    <Pencil/>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(event) => {
                                                    event.stopPropagation();
                                                    setDeleteLink(link.id)
                                                }
                                                }>
                                                    <Trash/>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TooltipProvider>
                            </TableRow>
                        )
                    }}
                    onFilterChange={setFilterData}
                    onCreateNew={() => setNewLink(true)}
                    onRefetchData={() => queryClient.invalidateQueries({queryKey: ['linktree', 'list']})}
                    loading={loading}
                    customFilter={[
                        <SearchFilter name={'displayname'} key={'search'}/>,
                    ]}
                />
            </div>
        </>
    );
}

export default LinktreeTable;