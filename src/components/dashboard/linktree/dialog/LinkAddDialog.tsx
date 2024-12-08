import useLinkStore from "@/stores/LinkStore.ts";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {FormSchema, LinkItemSchema} from "@/shemas/LinkSchema.ts";
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

// Default-Werte für das Formular
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
    const { addLink, fetchLinks } = useLinkStore();

    // React Hook Form Setup
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues,
    });

    // Formular-Submit-Handler
    const onSubmit = (values: z.infer<typeof LinkItemSchema>) => {
        try {
            addLink(values);
            toast.success("Link created successfully!");
            form.reset(defaultValues); // Formular zurücksetzen
            onOpenChange(false); // Dialog schließen
        } catch (error) {
            console.error("Error creating link:", error);
            toast.error("An error occurred while creating the link.");
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset(defaultValues); // Zurücksetzen der Werte und Fehler
        }
        fetchLinks(); // Links neu laden
        onOpenChange(isOpen); // Statusänderung weitergeben
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
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default LinkAddDialog;
