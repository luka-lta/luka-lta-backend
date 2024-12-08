import {useEffect, useMemo} from 'react';
import useLinkStore from "@/stores/LinkStore.ts";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {arrayMove, SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import LinkItem from "@/components/dashboard/linktree/LinkItem.tsx";
import {closestCenter, DndContext} from "@dnd-kit/core";

interface LinktreePageProps {
    edit: boolean;
    setEdit: (edit: boolean) => void;
    create: boolean;
    setCreate: (create: boolean) => void;
    setEditingLink: (link: LinkItemTypeSchema) => void;
    editingLink: LinkItemTypeSchema | undefined;
}

function LinksTable(
    {edit, setEdit, create, setCreate, setEditingLink}: LinktreePageProps
) {
    const {links, triggerFetch, deleteLink, isLoading, error} = useLinkStore();

    useEffect(() => {
        triggerFetch();
    }, [edit, create]);

    const sortedLinks = useMemo(() =>
            [...links].sort((a, b) => a.displayOrder - b.displayOrder),
        [links]
    );

    const handleDelete = async (id: number) => {
        await deleteLink(id);
    };

    const handleDragEnd = (event: any) => {
        const {active, over} = event;
        if (active.id !== over.id) {
            const oldIndex = sortedLinks.findIndex(link => link.id === active.id);
            const newIndex = sortedLinks.findIndex(link => link.id === over.id);
            const newLinks = arrayMove(sortedLinks, oldIndex, newIndex).map((link, index) => ({
                ...link,
                displayOrder: index + 1,
            }));
            console.log(newLinks);
        }
    };

    return (
        <>
            <Button disabled={!!error} onClick={() => setCreate(true)}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Link
            </Button>

            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created On</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    {isLoading ? (
                        <TableBody>
                            {Array(5).fill(null).map((_, index) => (
                                <TableRow key={index} className="animate-pulse">
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Skeleton className="w-8 h-8 rounded-full"/>
                                            <Skeleton className="w-20 h-5"/>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="w-2/3 h-5"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="w-1/2 h-5"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="w-16 h-5"/>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="w-24 h-5"/>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Skeleton className="w-16 h-8"/>
                                            <Skeleton className="w-16 h-8"/>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : sortedLinks.length > 0 ? (
                        <TableBody>
                            <SortableContext items={sortedLinks.map(link => link.id)}
                                             strategy={verticalListSortingStrategy}>
                                {sortedLinks.map((link) => (
                                    <LinkItem
                                        key={link.id}
                                        link={link}
                                        onDelete={() => handleDelete(link.id)}
                                        onEdit={() => {
                                            setEditingLink(link)
                                            setEdit(true)
                                        }}
                                    />
                                ))}
                            </SortableContext>
                        </TableBody>
                    ) : (
                        <div className="text-center">
                            {error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                <p className="text-muted-foreground">No links found</p>
                            )}
                        </div>
                    )}
                </Table>
            </DndContext>
        </>
    );
}

export default LinksTable;
