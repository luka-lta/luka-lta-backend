"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button.tsx"
import {RefreshCcw} from "lucide-react"

interface RefreshButtonProps {
    onRefresh: () => Promise<void>
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
    label?: string
}

export function RefreshButton({
                                  onRefresh,
                                  variant = "secondary",
                                  className = "flex items-center justify-center p-3",
                                  size,
                                  label,
                              }: RefreshButtonProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        if (isRefreshing) return

        setIsRefreshing(true)
        try {
            await onRefresh()
        } catch (error) {
            console.error("Error refreshing data:", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <Button variant={variant} className={className} size={size} onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className="h-4 w-4"/>
            {label && <span>{label}</span>}
        </Button>
    )
}

