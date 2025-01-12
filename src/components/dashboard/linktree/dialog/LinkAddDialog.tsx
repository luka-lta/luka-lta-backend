import {FormSchema} from "@/shemas/LinkSchema.ts";
import useLinkStore from "@/stores/LinkStore.ts";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.tsx";
import {Form,} from "@/components/ui/form.tsx";
import {Button} from "@/components/ui/button.tsx";
import AddForm from "@/components/dashboard/linktree/dialog/form/AddForm.tsx";
import {useCallback} from "react";

const defaultValues = {
    displayname: "",
    description: "",
    url: "",
    iconName: "",
    isActive: true,
};

interface LinkFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function LinkAddDialog({ open, onOpenChange }: LinkFormDialogProps) {
    const { addLink, isLoading} = useLinkStore();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues,
    });

    const onSubmit = useCallback(async (values: z.infer<typeof FormSchema>): Promise<void> => {
        try {
            await addLink(values);
            toast.success("Link created successfully!");
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating link:", error);
            toast.error("An error occurred while creating the link.");
        }
    }, [addLink, onOpenChange]);

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
                    <DialogTitle>Create Link</DialogTitle>
                    <DialogDescription>
                        Create an external link to your social media or website.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <AddForm form={form} />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default LinkAddDialog;
