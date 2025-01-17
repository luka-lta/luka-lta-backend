import { tasks } from "@/components/dashboard/todos/TodoDummy.ts";
import TodoItem from "@/components/dashboard/todos/TodoItem.tsx";
import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";

interface TodoOverViewProps {
    priorityFilter: string;
    statusFilter: string;
}

function TodoOverview({ priorityFilter, statusFilter }: TodoOverViewProps) {
    const isLoading = false;

    const filteredTasks: TodoTypeSchema[] = tasks.filter(todo =>
        (priorityFilter === "all" || todo.priority === priorityFilter) &&
        (statusFilter === "all" || todo.status === statusFilter)
    );

    return (
        <div className="space-y-4">
            {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map(todo => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-red-500">
                    <p>No Todos found</p>
                </div>
            )}
        </div>
    );
}

export default TodoOverview;
