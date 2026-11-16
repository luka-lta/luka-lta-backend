import { useEffect } from 'react'
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from "@/context/theme-context.tsx";

const OPTIONS = [
    { value: 'light', label: 'Hell', icon: Sun },
    { value: 'dark', label: 'Dunkel', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
] as const

export function ThemeSwitch() {
    const { theme, setTheme } = useTheme()

    // Browser-UI-Farbe an die Hintergrundfarbe angleichen.
    useEffect(() => {
        const meta = document.querySelector("meta[name='theme-color']")
        if (!meta) return
        const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
        if (bg) meta.setAttribute('content', `hsl(${bg})`)
    }, [theme])

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon-sm'>
                    <Sun className='rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
                    <Moon className='absolute rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
                    <span className='sr-only'>Farbschema wählen</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                {OPTIONS.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                        <Icon />
                        {label}
                        {theme === value && <Check className='ml-auto' />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
