import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {LinkItemTypeSchema} from "@/feature/linktree/schema/LinktreeSchema.ts";
type LinkDialogTypes =  'add' | 'edit' | 'delete'

interface UsersContextType {
    open: LinkDialogTypes | null
    setOpen: (str: LinkDialogTypes | null) => void
    currentRow: LinkItemTypeSchema | null
    setCurrentRow: React.Dispatch<React.SetStateAction<LinkItemTypeSchema | null>>
}

const LinksContext = React.createContext<UsersContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function LinksProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<LinkDialogTypes>(null)
    const [currentRow, setCurrentRow] = useState<LinkItemTypeSchema | null>(null)

    return (
        <LinksContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </LinksContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLinksContext = () => {
    const linksContext = React.useContext(LinksContext)

    if (!linksContext) {
        throw new Error('useUsers has to be used within <UsersContext>')
    }

    return linksContext
}
