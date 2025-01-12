import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {UseFormReturn} from "react-hook-form";
import {z} from "zod";
import {FormSchema} from "@/shemas/LinkSchema.ts";
import {IconSelector} from "@/components/IconSelector.tsx";

interface AddFormProps {
    form: UseFormReturn<z.infer<typeof FormSchema>>;
}

function AddForm({ form }: AddFormProps) {
    return (
        <>
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
                            <Input placeholder="https://github.com/yourusername" {...field} value={field.value ?? ''} />
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
                            <IconSelector value={field.value ?? ''} onChange={field.onChange} />
                            {/*<Input placeholder="FaGithub" {...field} value={field.value ?? ''} />*/}
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
        </>
    );
}

export default AddForm;