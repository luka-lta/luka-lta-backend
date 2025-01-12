import {FormSchema, LinkItemTypeSchema} from "@/shemas/LinkSchema.ts";
import useLinkStore from "@/stores/LinkStore.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {z} from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Form,} from "@/components/ui/form.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useCallback, useEffect} from "react";
import EditForm from "@/components/dashboard/linktree/dialog/form/EditForm.tsx";

const defaultValues = {
    displayname: "",
    description: null,
    url: "",
    iconName: null,
    isActive: true,
};

interface LinkFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: LinkItemTypeSchema
}

export function LinkEditDialog({ open, onOpenChange, initialData }: LinkFormDialogProps) {
    const { updateLink, isLoading } = useLinkStore();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const onSubmit = useCallback(async (values: z.infer<typeof FormSchema>): Promise<void> => {
        try {
            if (initialData) {
                await updateLink(initialData.id, values);
                toast.success("Link updated");
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error editing link:", error);
            toast.error("An error occurred while editing the link.");
        }
    }, [initialData, updateLink, form, onOpenChange]);

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
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <EditForm form={form} />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}