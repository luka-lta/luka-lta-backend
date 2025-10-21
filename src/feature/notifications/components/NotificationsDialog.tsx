import {useNotifications} from "@/feature/notifications/context/notifications-context.tsx";
import CreateNotificationDialog from "@/feature/notifications/components/CreateNotificationDialog.tsx";

function NotificationsDialog() {
    const {open, setOpen, currentRow, setCurrentRow} = useNotifications()

    return (
        <>
            <CreateNotificationDialog
                key='notifications-add'
                open={open === 'add'}
                onOpenChange={() => setOpen('add')}
            />
        </>
    );
}

export default NotificationsDialog;