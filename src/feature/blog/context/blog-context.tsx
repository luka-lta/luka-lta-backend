import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { BlogPostType } from '@/feature/blog/schema/BlogSchema'

type BlogDialogTypes = 'add' | 'edit' | 'delete'

interface BlogContextType {
    open: BlogDialogTypes | null
    setOpen: (str: BlogDialogTypes | null) => void
    currentRow: BlogPostType | null
    setCurrentRow: React.Dispatch<React.SetStateAction<BlogPostType | null>>
}

const BlogContext = React.createContext<BlogContextType | null>(null)

interface Props {
    children: React.ReactNode
}

export default function BlogProvider({ children }: Props) {
    const [open, setOpen] = useDialogState<BlogDialogTypes>(null)
    const [currentRow, setCurrentRow] = useState<BlogPostType | null>(null)

    return (
        <BlogContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
            {children}
        </BlogContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBlogContext = () => {
    const ctx = React.useContext(BlogContext)
    if (!ctx) throw new Error('useBlogContext must be used within BlogProvider')
    return ctx
}
