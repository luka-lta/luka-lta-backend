import {LinkFormSchema, LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import useLinkStore from "@/stores/LinkStore.ts";
import {useForm, UseFormReturn} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {useCallback, useEffect} from "react";
import { LinkForm } from "../form/LinkForm";

interface LinkFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: LinkItemTypeSchema
}

const defaultValues: object = {
    displayname: "",
    description: "",
    url: "",
    iconName: "",
    isActive: true,
}

export function LinkEditDialog({ open, onOpenChange, initialData }: LinkFormDialogProps) {
    const { updateLink, isLoading } = useLinkStore();

    const form: UseFormReturn<LinkItemTypeSchema> = useForm<LinkItemTypeSchema>({
        resolver: zodResolver(LinkFormSchema),
        defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const handleSubmit = useCallback(async (values: LinkItemTypeSchema) => {
        try {
            if (initialData) {
                await updateLink(initialData.id, values);
                toast.success("Link updated");
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error editing the link:", error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
        }
    }, [updateLink, onOpenChange, initialData]);

    const handleClose = async (isOpen: boolean): Promise<void> => {
        if (!isOpen) {
            form.reset(defaultValues);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Link</DialogTitle>
                    <DialogDescription>
                        Update your link details below
                    </DialogDescription>
                </DialogHeader>

                <LinkForm onOpenChange={onOpenChange} onSubmit={handleSubmit} initialData={initialData} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    )
}