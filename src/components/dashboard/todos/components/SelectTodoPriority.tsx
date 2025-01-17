import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select.tsx";
import {getPriorityBadge, TodoPriority} from "@/lib/componentUtils.tsx";
import {List} from "lucide-react";

interface TodoPriorityProps {
    setPriorityFilter: (priority: TodoPriority) => void;
    priorityFilter: TodoPriority;
}

function SelectTodoPriority({setPriorityFilter, priorityFilter}: TodoPriorityProps) {
    const priorities: TodoPriority[] = ["low", "medium", "high"];

    const handlePriorityChange = (priority: TodoPriority) => {
        setPriorityFilter(priority);
    }

    return (
        <Select onValueChange={handlePriorityChange} value={priorityFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue defaultValue="all" placeholder="Todo priority..." />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Todo priority</SelectLabel>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2 text-white-100">
                            <List className="w-4 h-4" /> All
                        </div>
                    </SelectItem>
                    {priorities.map(priority => {
                        const { icon } = getPriorityBadge(priority);
                        return (
                            <SelectItem key={priority} value={priority}>
                                <div className="flex items-center gap-2">{icon} {priority}</div>
                            </SelectItem>
                        );
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default SelectTodoPriority;
