import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {NotificationTypeSchema} from "@/feature/notifications/schema/NotificationSchema.ts";

type NotificationsDialogType = 'add' | 'edit' | 'delete'

interface NotificationsContextType {
    open: NotificationsDialogType | null
    setOpen: (str: NotificationsDialogType | null) => void
    currentRow: NotificationTypeSchema | null
    setCurrentRow: React.Dispatch<React.SetStateAction<NotificationTypeSchema | null>>
}

const NotificationsContext = React.createContext<NotificationsContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function NotificationsProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<NotificationsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<NotificationTypeSchema | null>(null)

    return (
        <NotificationsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </NotificationsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
    const notificationsContext = React.useContext(NotificationsContext)

    if (!notificationsContext) {
        throw new Error('useNotifications has to be used within <NotificationsContext>')
    }

    return notificationsContext
}
