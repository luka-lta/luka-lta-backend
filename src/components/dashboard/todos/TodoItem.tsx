import {TodoTypeSchema} from "@/shemas/TodoSchema.ts";
import {useState} from "react";
import TodoInfoModal from "@/components/dashboard/todos/modal/TodoInfoModal.tsx";

interface TodoItemProps {
    todo: TodoTypeSchema;
}

export function TodoItem({ todo }: TodoItemProps) {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const closeInfoModal = () => setIsInfoModalOpen(false);

    return (
        <div className="flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-800 rounded-md">
            <div className="flex items-center space-x-2 flex-grow">
                <span className="font-medium truncate max-w-[150px]">{todo.title}</span>
            </div>
            <TodoInfoModal isOpen={isInfoModalOpen} onClose={closeInfoModal} todo={todo} />
        </div>
    );
}

export default TodoItem;
