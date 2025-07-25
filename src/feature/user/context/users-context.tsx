import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {UserTypeSchema} from "@/feature/user/schema/UserSchema.ts";

type UsersDialogType = 'info' | 'add' | 'edit' | 'delete'

interface UsersContextType {
    open: UsersDialogType | null
    setOpen: (str: UsersDialogType | null) => void
    currentRow: UserTypeSchema | null
    setCurrentRow: React.Dispatch<React.SetStateAction<UserTypeSchema | null>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<UsersDialogType>(null)
    const [currentRow, setCurrentRow] = useState<UserTypeSchema | null>(null)

    return (
        <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </UsersContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
    const usersContext = React.useContext(UsersContext)

    if (!usersContext) {
        throw new Error('useUsers has to be used within <UsersContext>')
    }

    return usersContext
}
