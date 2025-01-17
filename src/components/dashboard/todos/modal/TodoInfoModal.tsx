import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon } from 'lucide-react';
import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {getPriorityBadge, getStatusBadge, TodoPriority, TodoStatus} from "@/lib/componentUtils.tsx";

interface TodoInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    todo: TodoTypeSchema
}

function TodoInfoModal({ isOpen, onClose, todo }: TodoInfoModalProps) {
    const { icon: statusIcon, color: statusColor } = getStatusBadge(todo.status as TodoStatus);
    const { icon: priorityIcon, color: priorityColor } = getPriorityBadge(todo.priority as TodoPriority);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleString();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{todo.title}</DialogTitle>
                </DialogHeader>
                <DialogDescription />
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-medium">Status:</span>
                        <Badge className={`col-span-3 ${statusColor}`}>
                            {statusIcon} {todo.status}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-medium">Priority:</span>
                        <Badge className={`col-span-3 ${priorityColor}`}>
                            {priorityIcon} {todo.priority}
                        </Badge>
                    </div>
                    {todo.description && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Description:</span>
                            <p className="col-span-3">{todo.description}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-medium">Due Date:</span>
                        <div className="col-span-3 flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(todo.dueDate)}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <span className="font-medium">Created:</span>
                        <div className="col-span-3 flex items-center">
                            <ClockIcon className="mr-2 h-4 w-4" />
                            {formatDate(todo.createdAt)}
                        </div>
                    </div>
                    {todo.updatedAt && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-medium">Updated:</span>
                            <div className="col-span-3 flex items-center">
                                <ClockIcon className="mr-2 h-4 w-4" />
                                {formatDate(todo.updatedAt)}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default TodoInfoModal;