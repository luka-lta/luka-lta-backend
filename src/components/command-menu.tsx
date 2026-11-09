import React from 'react'
import { useNavigate } from "react-router-dom";
import { ArrowRight, FilePlus2, Laptop, LinkIcon, Moon, Plus, Sun } from "lucide-react";
import { useSearch } from '@/context/search-context'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { useTheme } from "@/context/theme-context.tsx";

const QUICK_ACTIONS = [
    { label: 'Neuer Blogbeitrag', icon: FilePlus2, to: '/dashboard/blog/create' },
    { label: 'Links verwalten', icon: LinkIcon, to: '/dashboard/linktree' },
    { label: 'Projekt anlegen', icon: Plus, to: '/dashboard/projects' },
] as const

/** ⌘K-Befehlspalette: Navigation, Schnellaktionen, Farbschema. */
export function CommandMenu() {
    const navigate = useNavigate()
    const { setTheme } = useTheme()
    const { open, setOpen } = useSearch()

    const run = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [setOpen])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder='Seite oder Aktion suchen…' />
            <CommandList className='max-h-[min(24rem,60svh)]'>
                <CommandEmpty>Keine Treffer.</CommandEmpty>
                <CommandGroup heading='Schnellaktionen'>
                    {QUICK_ACTIONS.map((action) => (
                        <CommandItem key={action.label} value={action.label} onSelect={() => run(() => navigate(action.to))}>
                            <action.icon />
                            {action.label}
                        </CommandItem>
                    ))}
                </CommandGroup>
                {sidebarData.navGroups.map((group, gi) => (
                    <CommandGroup key={group.title ?? gi} heading={group.title ?? 'Allgemein'}>
                        {group.items.flatMap((item) => (item.items ? item.items.map((sub) => ({ ...sub, title: `${item.title} › ${sub.title}` })) : [item])).map((item) => (
                            <CommandItem key={item.url} value={item.title} onSelect={() => run(() => navigate(item.url))}>
                                {item.icon ? <item.icon /> : <ArrowRight />}
                                {item.title}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
                <CommandGroup heading='Konto'>
                    {sidebarData.accountLinks.map((item) => (
                        <CommandItem key={item.url} value={item.title} onSelect={() => run(() => navigate(item.url))}>
                            {item.icon ? <item.icon /> : <ArrowRight />}
                            {item.title}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading='Farbschema'>
                    <CommandItem value='Hell' onSelect={() => run(() => setTheme('light'))}><Sun />Hell</CommandItem>
                    <CommandItem value='Dunkel' onSelect={() => run(() => setTheme('dark'))}><Moon />Dunkel</CommandItem>
                    <CommandItem value='System' onSelect={() => run(() => setTheme('system'))}><Laptop />System</CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
