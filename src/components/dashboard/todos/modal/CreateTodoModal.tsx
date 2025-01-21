import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {TodoFormSchema, TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {toast} from "sonner";
import {useCallback} from "react";
import TodoForm from "@/components/dashboard/todos/form/TodoForm.tsx";
import {useTodoStore} from "@/stores/TodoStore.ts";

type FormData = typeof TodoFormSchema._type

interface CreateTodoModalProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function CreateTodoModal({ open, setOpen }: CreateTodoModalProps) {
    const { isLoading, fetchTodos, addTodo } = useTodoStore();

    const handleSubmit = useCallback(async (data: TodoTypeSchema) => {
        const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
        ) as FormData;

        await addTodo(sanitizedData);
        await fetchTodos();
        toast.success("Todo created successfully!");
        setOpen(false);
    }, [addTodo, fetchTodos, setOpen]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Todo</DialogTitle>
                    <DialogDescription>Add a new todo item to your list. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <TodoForm onSubmit={handleSubmit} isLoading={isLoading} onOpenChange={setOpen} />
            </DialogContent>
        </Dialog>
    )
}

