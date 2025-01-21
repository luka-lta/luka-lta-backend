import {Button} from "@/components/ui/button.tsx";
import {PlusIcon} from "lucide-react";
import SelectTodoStatus from "@/components/dashboard/todos/components/SelectTodoStatus.tsx";
import SelectTodoPriority from "@/components/dashboard/todos/components/SelectTodoPriority.tsx";
import {CreateTodoModal} from "@/components/dashboard/todos/modal/CreateTodoModal.tsx";
import {useEffect, useState} from "react";
import {TodoPriority, TodoStatus} from "@/lib/componentUtils.tsx";
import {useSearchParams} from "react-router-dom";
import {useTodoStore} from "@/stores/TodoStore.ts";
import {toast} from "sonner";
import TodoTableView from "@/components/dashboard/todos/TodoTable.tsx";

function TodoPage() {
    const {fetchTodos} = useTodoStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const [statusFilter, setStatusFilter] = useState<TodoStatus>(
        (searchParams.get("status") as TodoStatus) || "all"
    );
    const [priorityFilter, setPriorityFilter] = useState<TodoPriority>(
        (searchParams.get("priority") as TodoPriority) || "all"
    );
    const [createModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (priorityFilter !== "all") params.set("priority", priorityFilter);
        setSearchParams(params);

        fetchTodos().catch((error: unknown) => {
            if (error instanceof Error) {
                console.error("Error fetching todos:", error);
                toast.error("An error occurred while fetching todos.");
            }
        });
    }, [statusFilter, priorityFilter, setSearchParams, fetchTodos]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Your Todo's</h1>

            <div className="flex justify-between items-center mb-6">
                <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Todo
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="todoStatus" className="text-sm font-medium text-gray-700 mb-1">
                            Status auswählen
                        </label>
                        <SelectTodoStatus
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="todoPriority" className="text-sm font-medium text-gray-700 mb-1">
                            Priorität auswählen
                        </label>
                        <SelectTodoPriority
                            setPriorityFilter={setPriorityFilter}
                            priorityFilter={priorityFilter}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Todo Dashboard</h1>
                <TodoTableView priorityFilter={priorityFilter} statusFilter={statusFilter}/>
            </div>

            <CreateTodoModal open={createModalOpen} setOpen={setCreateModalOpen}/>
        </div>
    );

}

export default TodoPage;