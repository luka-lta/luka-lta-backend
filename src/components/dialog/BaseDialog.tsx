import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface BaseDialogProps {
    title: string;
    description?: string;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    children?: ReactNode;
    footer?: ReactNode;
}

function BaseDialog({ title, description, open, setOpen, children, footer }: BaseDialogProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                {children && (
                    <div className="py-4">{children}</div>
                )}

                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}

export default BaseDialog;
