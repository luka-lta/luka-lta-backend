import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    /** Accessible Name, Standard = placeholder. */
    label?: string
    className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Suchen…', label, className }: SearchInputProps) {
    return (
        <div className={cn('relative w-full sm:w-64', className)}>
            <Search className='pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' aria-hidden />
            <Input
                type='search'
                role='searchbox'
                aria-label={label ?? placeholder}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden'
            />
            {value && (
                <button
                    type='button'
                    onClick={() => onChange('')}
                    className='absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                    <X className='size-3.5' aria-hidden />
                    <span className='sr-only'>Suche leeren</span>
                </button>
            )}
        </div>
    )
}
