import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { LinkFormSchema, LinkItemTypeSchema } from "@/shemas/LinkSchema.ts";
import {useCallback, useEffect} from "react";
import {DialogFooter} from "@/components/ui/dialog.tsx";

interface LinkFormProps {
    initialData?: LinkItemTypeSchema;
    onSubmit: (values: LinkItemTypeSchema) => Promise<void>;
    isLoading: boolean;
    onOpenChange: (state: boolean) => void;
}

const defaultValues: Partial<LinkItemTypeSchema> = {
    displayname: "",
    description: "",
    url: "",
    iconName: "FaLink",
    isActive: true,
};

export function LinkForm({ initialData, onSubmit, isLoading, onOpenChange }: LinkFormProps) {
    const form = useForm<LinkItemTypeSchema>({
        resolver: zodResolver(LinkFormSchema),
        defaultValues: initialData ?? defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
        if (!open) form.reset();
    }, [initialData, form]);

    const handleSubmit = useCallback(async (values: LinkItemTypeSchema) => {
        await onSubmit(values);
    }, [onSubmit]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                                <Textarea placeholder="Check out my projects" {...field} value={field.value ?? ''} />
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
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Active</FormLabel>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
