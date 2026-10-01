import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command.tsx";
import { cn } from "@/lib/utils.ts";
import { ICON_NAMES } from "@/lib/icons.ts";
import { LinkIcon } from "@/components/LinkIcon.tsx";

interface IconPickerProps {
    value?: string | null;
    onChange: (value: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);

    function handleSelect(name: string | null) {
        onChange(name);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="flex items-center gap-2 truncate">
                        {value ? <LinkIcon name={value} className="h-4 w-4 shrink-0" /> : null}
                        {value ?? <span className="text-muted-foreground">Select icon...</span>}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0">
                <Command>
                    <CommandInput placeholder="Search icon..." />
                    <CommandList>
                        <CommandEmpty>No icon found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem value="__none__" onSelect={() => handleSelect(null)}>
                                <span className="text-muted-foreground">None</span>
                            </CommandItem>
                            {ICON_NAMES.map((name) => (
                                <CommandItem key={name} value={name} onSelect={() => handleSelect(name)}>
                                    <LinkIcon name={name} className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{name}</span>
                                    <Check className={cn("ml-auto h-4 w-4", value === name ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
