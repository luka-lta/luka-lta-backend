import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'
import { useAuthenticatedUserStore } from '@/feature/login/hooks/useAuthenticatedStore.ts'

interface SiteLogoProps {
    className?: string
    collapsed?: boolean
    withText?: boolean
}

function LdsIcon({ size = 28 }: { size?: number }) {
    const gap = size * 0.107
    const sq = (size - gap) / 2

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
            <rect x={0} y={0} width={sq} height={sq} rx={sq * 0.2} fill="hsl(var(--primary))" />
            <rect x={sq + gap} y={0} width={sq} height={sq} rx={sq * 0.2} fill="hsl(var(--primary))" />
            <rect x={0} y={sq + gap} width={sq} height={sq} rx={sq * 0.2} fill="hsl(var(--primary))" />
            {/* bottom-right: Cyber Teal */}
            <rect x={sq + gap} y={sq + gap} width={sq} height={sq} rx={sq * 0.2} fill="#00D4AA" />
        </svg>
    )
}

export default function SiteLogo({ className, collapsed: collapsedProp, withText = true }: SiteLogoProps) {
    const { isAuthenticated } = useAuthenticatedUserStore()

    const sidebarContext = (() => {
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useSidebar()
        } catch {
            return null
        }
    })()

    const isCollapsed = collapsedProp ?? sidebarContext?.state === 'collapsed'

    return (
        <Link to={isAuthenticated() ? '/dashboard' : '/'} className={className}>
            <div className='flex items-center gap-2.5 px-1 py-1'>
                <div className='shrink-0'>
                    <LdsIcon size={28} />
                </div>
                <span
                    className={cn(
                        'text-base font-bold tracking-tight transition-all duration-200 leading-none font-sora',
                        isCollapsed && 'w-0 opacity-0 hidden'
                    )}
                >
                    {withText ? (
                        <>
                            <span className='text-primary'>Luka</span>
                            <span className='text-foreground'> Dev</span>
                        </>
                    ) : ''}
                </span>
            </div>
        </Link>
    )
}
