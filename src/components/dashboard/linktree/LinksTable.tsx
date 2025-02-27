import {useMemo} from 'react';
import useLinkStore from "@/stores/LinkStore.ts";
import {arrayMove, SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import LinkItem from "@/components/dashboard/linktree/LinkItem.tsx";
import {closestCenter, DndContext, DragEndEvent} from "@dnd-kit/core";
import LinkSkeleton from "@/components/dashboard/linktree/LinkSkeleton.tsx";
import RowActions from "@/components/Row-actions.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

interface LinktreePageProps {
    links: LinkItemTypeSchema[] | undefined;
    setEdit: (edit: boolean) => void;
    setEditingLink: (link: LinkItemTypeSchema) => void;
    editingLink: LinkItemTypeSchema | undefined;
    setDeleteLinkId: (id: number) => void;
    setDeleteDialog: (open: boolean) => void;
}

function LinksTable(
    {links, setEdit, setEditingLink, setDeleteLinkId, setDeleteDialog}: LinktreePageProps
) {
    const {isLoading, error} = useLinkStore();

    const sortedLinks = useMemo(() => {
        if (!links) return [];

        return links.slice().sort((a, b) => a.displayOrder - b.displayOrder);
    }, [links]);

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over) return;
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

    const renderLinkList = () => (
        <TableBody>
            <SortableContext items={sortedLinks.map(link => link.id)}
                             strategy={verticalListSortingStrategy}>
                {sortedLinks.map((link) => (
                    <LinkItem
                        key={link.id}
                        link={link}
                        onDelete={() => {
                            setDeleteLinkId(link.id)
                            setDeleteDialog(true)
                        }}
                        onEdit={() => {
                            setEditingLink(link)
                            setEdit(true)
                        }}
                    />
                ))}
            </SortableContext>
        </TableBody>
    );

    return (
        <>
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <ScrollArea className="rounded-md border p-3 max-h-[800px] overflow-y-auto">
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
                                    <LinkSkeleton key={index}/>
                                ))}
                            </TableBody>
                        ) : sortedLinks.length > 0 ? (
                            renderLinkList()
                        ) : (
                            <div className="text-center">
                                {error ? (
                                    <p className="text-red-500">{error}</p>
                                ) : (
                                    <p className="text-red-500">No links found</p>
                                )}
                            </div>
                        )}
                    </Table>

                </ScrollArea>

                <RowActions rowsPerPage={10} totalRows={sortedLinks.length}/>
            </DndContext>
        </>
    );
}

export default LinksTable;
