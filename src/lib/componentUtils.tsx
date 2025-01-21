import {Circle, Loader, CheckCircle, ChevronsDown, ChevronRight, ChevronsUp, Archive} from "lucide-react";
import {TodoSchema} from "@/shemas/TodoSchema.ts";

export type TodoStatus = typeof TodoSchema.shape.status._type;
export type TodoPriority = typeof TodoSchema.shape.priority._type;

export function getStatusBadge(status: TodoStatus): { icon: JSX.Element; color: string } {
    const statusMap: Record<TodoStatus, { icon: JSX.Element; color: string }> = {
        "open": { icon: <Circle className="w-4 h-4 text-gray-700" />, color: "bg-gray-200 text-gray-800" },
        "in_progress": { icon: <Loader className="w-4 h-4 text-yellow-500 animate-spin" />, color: "bg-yellow-200 text-yellow-800" },
        "completed": { icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: "bg-green-200 text-green-800" },
        "archived": { icon: <Archive className="w-4 h-4 text-blue-500" />, color: "bg-blue-200 text-blue-800" },
        "all": { icon: <Circle className="w-4 h-4 text-gray-700" />, color: "bg-gray-200 text-gray-800" }
    };

    return statusMap[status];
}

export function getPriorityBadge(priority: TodoPriority): { icon: JSX.Element; color: string } {
    const priorityMap: Record<TodoPriority, { icon: JSX.Element; color: string }> = {
        "low": { icon: <ChevronsDown className="w-4 h-4 text-gray-500" />, color: "bg-gray-200 text-gray-800" },
        "medium": { icon: <ChevronRight className="w-4 h-4 text-orange-500" />, color: "bg-orange-200 text-orange-800" },
        "high": { icon: <ChevronsUp className="w-4 h-4 text-red-500" />, color: "bg-red-200 text-red-800" },
        "all": { icon: <Circle className="w-4 h-4 text-gray-700" />, color: "bg-gray-200 text-gray-800" }
    };

    return priorityMap[priority];
}
