import { cn, splitAvatarUrl } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const SIZE = {
    xs: 'size-6 text-[10px]',
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-16 text-lg',
} as const

interface UserAvatarProps {
    name?: string | null
    email?: string | null
    /** Pfad aus der API (wird über splitAvatarUrl aufgelöst). */
    avatarUrl?: string | null
    size?: keyof typeof SIZE
    className?: string
}

function initials(name?: string | null, email?: string | null): string {
    const source = (name || email || '?').trim()
    const parts = source.split(/[\s._@-]+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return source.slice(0, 2).toUpperCase()
}

export function UserAvatar({ name, email, avatarUrl, size = 'sm', className }: UserAvatarProps) {
    return (
        <Avatar className={cn('rounded-lg', SIZE[size], className)}>
            <AvatarImage src={splitAvatarUrl(avatarUrl)} alt='' className='object-cover' />
            <AvatarFallback className='rounded-lg bg-primary/10 font-medium text-primary'>{initials(name, email)}</AvatarFallback>
        </Avatar>
    )
}
