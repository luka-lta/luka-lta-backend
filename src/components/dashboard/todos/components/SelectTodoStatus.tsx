import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { List, } from "lucide-react";
import {getStatusBadge, TodoStatus} from "@/lib/componentUtils.tsx";

interface TodoStatusProps {
    setStatusFilter: (status: TodoStatus) => void;
    statusFilter: TodoStatus;
}

function SelectTodoStatus({setStatusFilter, statusFilter}: TodoStatusProps) {
    const statuses: TodoStatus[] = ["todo", "in-progress", "done"];

    const handleStatusChange = (status: TodoStatus) => {
        setStatusFilter(status);
    }

    return (
        <Select onValueChange={handleStatusChange} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue defaultValue="all" placeholder="Todo status..." />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Todo status</SelectLabel>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2 text-white-100">
                            <List className="w-4 h-4" /> All
                        </div>
                    </SelectItem>
                    {statuses.map(status => {
                        const { icon } = getStatusBadge(status);
                        return (
                            <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">{icon} {status}</div>
                            </SelectItem>
                        );
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectTodoStatus;
