import TodoOverview from "@/components/dashboard/todos/TodoOverview.tsx";
import {Button} from "@/components/ui/button.tsx";
import {PlusIcon} from "lucide-react";
import SelectTodoStatus from "@/components/dashboard/todos/components/SelectTodoStatus.tsx";
import SelectTodoPriority from "@/components/dashboard/todos/components/SelectTodoPriority.tsx";
import {CreateTodoModal} from "@/components/dashboard/todos/modal/CreateTodoModal.tsx";
import {useEffect, useState} from "react";
import {TodoPriority, TodoStatus} from "@/lib/componentUtils.tsx";
import {useSearchParams} from "react-router-dom";

function TodoPage() {
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
    }, [statusFilter, priorityFilter, setSearchParams]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-5">Your todo's</h1>
            <div className="flex items-center">
                <Button
                    onClick={() => setCreateModalOpen(true)}
                >
                    <PlusIcon/>
                </Button>
                <SelectTodoStatus statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
                <SelectTodoPriority setPriorityFilter={setPriorityFilter} priorityFilter={priorityFilter}/>
            </div>
            <TodoOverview priorityFilter={priorityFilter} statusFilter={statusFilter}/>

            <CreateTodoModal open={createModalOpen} setOpen={setCreateModalOpen}/>
        </div>
    );
}

export default TodoPage;