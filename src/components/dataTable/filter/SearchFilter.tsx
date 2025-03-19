import { useContext, useEffect } from 'react'
import { CustomFilterContext } from './CustomFilterContext'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as React from "react";

type SearchFilterProps = {
    name: string,
    placeholder?: string,
    className?: string
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ name, placeholder = 'Search...', className }) => {
    const context = useContext(CustomFilterContext);

    useEffect(() => {
        // Init the value empty
        context.onFilterValueChange(name, '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <label className={cn(
            "flex h-10 w-[330px] items-center rounded-md border border-input bg-body pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
            className
        )}>
            <Search className="h-[16px] w-[16px] text-muted-foreground" />
            <input
                type="search"
                className="w-full pl-2 !outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed bg-transparent border-transparent focus:border-transparent focus:ring-0 h-8"
                value={context.filter[name] as string ?? ''}
                onChange={(evt) => {
                    context.onFilterValueChange(name, evt.currentTarget.value)
                }}
                placeholder={placeholder}
            />
        </label>
    );
}
