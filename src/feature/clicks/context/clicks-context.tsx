import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import {clickTypeSchema} from "@/feature/clicks/schema/clickSchema.ts";

type ClicksDialogType = 'info'

interface ClicksContextType {
    open: ClicksDialogType | null
    setOpen: (str: ClicksDialogType | null) => void
    currentRow: clickTypeSchema | null
    setCurrentRow: React.Dispatch<React.SetStateAction<clickTypeSchema | null>>
}

const ClicksContext = React.createContext<ClicksContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function ClicksProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<ClicksDialogType>(null)
    const [currentRow, setCurrentRow] = useState<clickTypeSchema | null>(null)

    return (
        <ClicksContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </ClicksContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useClicksContext = () => {
    const clicksContext = React.useContext(ClicksContext)

    if (!clicksContext) {
        throw new Error('useClicks has to be used within <ClicksContext>')
    }

    return clicksContext
}
