import { CardHeader, CardTitle, Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Pencil, Trash2} from "lucide-react";
import {getPriorityBadge, getStatusBadge, TodoPriority, TodoStatus} from "@/lib/componentUtils.tsx";
import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {useState} from "react";
import TodoInfoModal from "@/components/dashboard/todos/modal/TodoInfoModal.tsx";

interface TodoItemProps {
    todo: TodoTypeSchema;
}

export function TodoItem({ todo }: TodoItemProps) {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const { icon: statusIcon, color: statusColor } = getStatusBadge(todo.status as TodoStatus);
    const { icon: priorityIcon, color: priorityColor } = getPriorityBadge(todo.priority as TodoPriority);

    const openInfoModal = () => setIsInfoModalOpen(true);
    const closeInfoModal = () => setIsInfoModalOpen(false);

    return (
        <>
            <Card className='cursor-pointer' onClick={openInfoModal}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                        <span>{todo.title}</span>
                        <div className="flex space-x-2">
                            <Badge className={`flex items-center gap-1 ${statusColor}`}>
                                {statusIcon} {todo.status}
                            </Badge>
                            <Badge className={`flex items-center gap-1 ${priorityColor}`}>
                                {priorityIcon} {todo.priority}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600">{todo.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Due: {todo.dueDate}</p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <TodoInfoModal isOpen={isInfoModalOpen} onClose={closeInfoModal} todo={todo} />
        </>
    );
}

export default TodoItem;
