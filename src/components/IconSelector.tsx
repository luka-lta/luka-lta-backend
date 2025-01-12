import React, { useState } from 'react'
import {
    FaHome, FaUser, FaCog, FaEnvelope, FaSearch, FaHeart, FaStar,
    FaBookmark, FaCalendar, FaCamera, FaMusic, FaVideo, FaFile,
    FaFolder, FaMap, FaShoppingCart, FaComment, FaBell, FaLock,
    FaKey, FaWifi, FaBatteryFull, FaCloud, FaSun, FaMoon, FaGithub
} from 'react-icons/fa'
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

const iconList = [
    { name: 'FaHome', component: FaHome },
    { name: 'FaUser', component: FaUser },
    { name: 'FaCog', component: FaCog },
    { name: 'FaEnvelope', component: FaEnvelope },
    { name: 'FaSearch', component: FaSearch },
    { name: 'FaHeart', component: FaHeart },
    { name: 'FaStar', component: FaStar },
    { name: 'FaBookmark', component: FaBookmark },
    { name: 'FaCalendar', component: FaCalendar },
    { name: 'FaCamera', component: FaCamera },
    { name: 'FaMusic', component: FaMusic },
    { name: 'FaVideo', component: FaVideo },
    { name: 'FaFile', component: FaFile },
    { name: 'FaFolder', component: FaFolder },
    { name: 'FaMap', component: FaMap },
    { name: 'FaShoppingCart', component: FaShoppingCart },
    { name: 'FaComment', component: FaComment },
    { name: 'FaBell', component: FaBell },
    { name: 'FaLock', component: FaLock },
    { name: 'FaKey', component: FaKey },
    { name: 'FaWifi', component: FaWifi },
    { name: 'FaBatteryFull', component: FaBatteryFull },
    { name: 'FaCloud', component: FaCloud },
    { name: 'FaSun', component: FaSun },
    { name: 'FaMoon', component: FaMoon },
    { name: 'FaGithub', component: FaGithub },
]

interface IconSelectorProps {
    value: string
    onChange: (value: string) => void
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value ? (
                        <>
                            {React.createElement(iconList.find(icon => icon.name === value)?.component || FaHome, {
                                className: "mr-2 h-4 w-4"
                            })}
                            {value}
                        </>
                    ) : (
                        "Select icon..."
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search icons..." />
                    <CommandEmpty>No icon found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea className="h-[200px]">
                            {iconList.map(({ name, component: IconComponent }) => (
                                <CommandItem
                                    key={name}
                                    value={name}
                                    onSelect={() => {
                                        onChange(name)
                                        setOpen(false)
                                    }}
                                >
                                    <IconComponent className="mr-2 h-4 w-4" />
                                    {name}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

