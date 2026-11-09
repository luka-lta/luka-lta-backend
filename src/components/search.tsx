import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { SearchIcon } from "lucide-react";
import { useSearch } from '@/context/search-context';

export function Search({ className = '' }: { className?: string }) {
    const { setOpen } = useSearch()
    return (
        <Button
            variant='outline'
            onClick={() => setOpen(true)}
            className={cn('h-8 justify-start gap-2 px-2 font-normal text-muted-foreground shadow-none sm:w-56 sm:pr-12 relative', className)}
        >
            <SearchIcon aria-hidden='true' />
            <span className='hidden sm:inline'>Suchen…</span>
            <span className='sr-only sm:hidden'>Suchen</span>
            <kbd className='pointer-events-none absolute right-1.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex'>
                <span className='text-xs'>⌘</span>K
            </kbd>
        </Button>
    )
}
