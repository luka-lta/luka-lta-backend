import {LinkItemSchema} from "@/lib/LinkTypes.ts";
import {LinkItemType} from "@/lib/types/LinkItemType.ts";
import useLinkStore from "@/lib/LinkStore.ts";
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Button} from "@/components/ui/button.tsx";

const formSchema = LinkItemSchema.omit({ id: true, createdOn: true, displayOrder: true })

interface LinkFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: LinkItemType
}

export function LinkFormDialog({ open, onOpenChange, initialData }: LinkFormDialogProps) {
    const { updateLink } = useLinkStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            displayname: "",
            description: "",
            url: "",
            isActive: true,
            iconName: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (initialData) {
                updateLink(initialData.id, values)
                toast.success("Link updated")
            } else {
                // addLink(values)
                toast.success("Link created")
            }
            form.reset()
            onOpenChange(false)
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Link" : "Add Link"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Update your link details below"
                            : "Add a new link to your linktree"}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="displayname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="GitHub" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Check out my projects" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://github.com/yourusername" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iconName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="github" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active</FormLabel>
                                        <FormDescription>
                                            Show or hide this link on your linktree
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}