import {Button} from "@/components/ui/button.tsx";
import {Plus} from "lucide-react";

interface AddButtonProps {
    onClick: () => void;
    label?: string;
}

function AddButton({onClick, label}: AddButtonProps) {
    return (
        <>
            <Button onClick={onClick} className="mb-4">
                <Plus className="mr-2 h-4 w-4" />
                {label}
            </Button>
        </>
    );
}

export default AddButton;