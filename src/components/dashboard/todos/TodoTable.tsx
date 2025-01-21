import TodoItem from "@/components/dashboard/todos/TodoItem";
import { TodoTypeSchema } from "@/shemas/TodoSchema";
import { useTodoStore } from "@/stores/TodoStore";
import {getStatusBadge, TodoStatus} from "@/lib/componentUtils.tsx";

interface TodoTableViewProps {
    priorityFilter: string;
    statusFilter: string;
}

function TodoTableView({ priorityFilter, statusFilter }: TodoTableViewProps) {
    const { todos, isLoading, error } = useTodoStore();

    if (isLoading) {
        return <p className="text-center text-gray-500">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    if (!todos || todos.length === 0) {
        return <p className="text-center text-red-500">No todos found</p>;
    }

    const filteredTodos: TodoTypeSchema[] = todos.filter(todo =>
        (priorityFilter === "all" || todo.priority === priorityFilter) &&
        (statusFilter === "all" || todo.status === statusFilter)
    );

    const todosByStatus = {
        open: filteredTodos.filter(todo => todo.status === 'open'),
        in_progress: filteredTodos.filter(todo => todo.status === 'in_progress'),
        completed: filteredTodos.filter(todo => todo.status === 'completed'),
        archived: filteredTodos.filter(todo => todo.status === 'archived'),
    };

    const renderTodoList = (todos: TodoTypeSchema[]) => (
        <div className="space-y-2">
            {todos.map(todo => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(todosByStatus).map(([status, todos]) => {
                const { icon, color } = getStatusBadge(status as TodoStatus);
                return (
                    <div key={status} className="bg-gray-900 p-4 rounded-lg shadow-lg shadow-gray-600/30">
                        <div className={`flex items-center gap-2 mb-3 ${color} rounded-full px-3 py-1 text-sm font-medium w-fit`}>
                            {icon}
                            <h2 className="capitalize">{status.replace('_', ' ')}</h2>
                        </div>
                        {renderTodoList(todos)}
                    </div>
                );
            })}
        </div>
    );
}

export default TodoTableView;

