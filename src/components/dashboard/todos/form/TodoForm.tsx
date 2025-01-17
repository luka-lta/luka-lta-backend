import {TodoFormSchema, TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {useForm} from "react-hook-form";
import {useEffect, useCallback} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {getPriorityBadge, getStatusBadge, TodoPriority, TodoStatus} from "@/lib/componentUtils.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";
import {DialogFooter} from "@/components/ui/dialog.tsx";

interface TodoFormProps {
    initialData?: TodoTypeSchema;
    onSubmit: (values: TodoTypeSchema) => Promise<void>;
    isLoading: boolean;
    onOpenChange: (state: boolean) => void;
}

const defaultValues: Partial<TodoTypeSchema> = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: undefined,
};

function TodoForm({initialData, onSubmit, isLoading, onOpenChange}: TodoFormProps) {
    const priorities: TodoPriority[] = ["low", "medium", "high"];
    const statuses: TodoStatus[] = ["todo", "in-progress", "done"];

    const form = useForm<TodoTypeSchema>({
        resolver: zodResolver(TodoFormSchema),
        defaultValues: initialData ?? defaultValues,
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [form, initialData]);

    const handleSubmit = useCallback(async (values: TodoTypeSchema) => {
        await onSubmit(values);
    }, [onSubmit]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Create new project..." {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Create a new endpoint..." {...field} value={field.value ?? ''}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priority"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                                <Select {...field} onValueChange={field.onChange}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a priority"/></SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(priority => (
                                            <SelectItem key={priority} value={priority}>
                                                <div className="flex items-center gap-2">
                                                    {getPriorityBadge(priority).icon} {priority}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <Select {...field} onValueChange={field.onChange}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a status"/></SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(status => (
                                            <SelectItem key={status} value={status}>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(status).icon} {status}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dueDate"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(new Date(field.value), "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage/>
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

export default TodoForm;
