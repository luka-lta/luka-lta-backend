import type { ReactNode } from 'react'
import SiteLogo from '@/components/SiteLogo.tsx'

interface Props {
    children: ReactNode
}

/** Zentrierte Fläche für Login und Fehlerseiten außerhalb des Dashboards. */
export default function AuthLayout({ children }: Props) {
    return (
        <div className='relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4'>
            <div
                className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]'
                aria-hidden='true'
            />
            <main className='relative z-10 mx-auto flex w-full max-w-sm flex-col gap-6 py-8'>
                <div className='flex items-center justify-center gap-2.5'>
                    <SiteLogo withText={false} />
                    <span className='font-brand text-xl font-semibold'>Luka Dev Studio</span>
                </div>
                {children}
            </main>
        </div>
    )
}
