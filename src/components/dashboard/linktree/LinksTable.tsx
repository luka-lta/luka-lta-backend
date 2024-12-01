import {useEffect, useMemo, useState} from 'react';
import useLinkStore from "@/lib/LinkStore.ts";
import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import LinkItem from "@/components/dashboard/linktree/LinkItem.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {LinkItemType} from "@/lib/types/LinkItemType.ts";
import {LinkFormDialog} from "@/components/dashboard/linktree/LinkFormDialog.tsx";

function LinksTable() {
    const [open, setOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkItemType | undefined>()
    const {links, fetchLinks, deleteLink, isLoading, error} =
        useLinkStore();

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks, open]);

    const sortedLinks = useMemo(() =>
            [...links].sort((a, b) => a.displayOrder - b.displayOrder),
        [links]
    );

    const handleDelete = (id: number) => {
        deleteLink(id);
    };

    return (
        <div className="space-y-4">
            <Button disabled={!!error}>
                <Plus className="mr-2 h-4 w-4"/>
                Add Link
            </Button>

            {/* Container for centering */}
            <div className="mx-auto max-w-4xl px-4">
                <div className="rounded-md border">
                    {isLoading ? (
                        <>
                            {Array(5).fill(null).map((_, index) => (
                                <Skeleton key={index} className="flex items-center justify-between p-4">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex flex-col space-y-2 w-full">
                                        <Skeleton className="w-2/3 h-5" />
                                        <Skeleton className="w-1/2 h-4" />
                                    </div>
                                </Skeleton>
                            ))}
                        </>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) :  sortedLinks.length > 0 ? (
                        <SortableContext items={sortedLinks.map(link => link.id)} strategy={verticalListSortingStrategy}>
                            <div className="divide-y">
                                {sortedLinks.map((link) => (
                                    <LinkItem
                                        key={link.id}
                                        link={link}
                                        onDelete={() => handleDelete(link.id)}
                                        onEdit={() => {
                                            setEditingLink(link)
                                            setOpen(true)
                                        }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    ) : (
                        <p className="text-center text-muted-foreground">No links found</p>
                    )}
                </div>
            </div>
            <LinkFormDialog
                open={open}
                onOpenChange={(open) => {
                    setOpen(open)
                    if (!open) setEditingLink(undefined)
                }}
                initialData={editingLink}
            />
        </div>
    );
}

export default LinksTable;
