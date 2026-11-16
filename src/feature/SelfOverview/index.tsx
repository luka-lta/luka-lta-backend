import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Palette, ShieldCheck, UserCog } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/layout/page.tsx'
import { cn } from '@/lib/utils.ts'

const SETTINGS_NAV = [
    { title: 'Profil', href: '/dashboard/settings', icon: UserCog },
    { title: 'Konto & Sicherheit', href: '/dashboard/settings/account', icon: ShieldCheck },
    { title: 'Darstellung', href: '/dashboard/settings/appearance', icon: Palette },
] as const

function Settings() {
    const { pathname } = useLocation()
    const current = SETTINGS_NAV.find((item) => item.href === pathname) ?? SETTINGS_NAV[0]

    return (
        <PageContainer title={`${current.title} · Einstellungen`} width='narrow'>
            <PageHeader title='Einstellungen' description='Profil, Zugang und Darstellung deines Kontos.' />

            <div className='flex flex-col gap-6 lg:flex-row lg:gap-10'>
                <nav aria-label='Einstellungen' className='-mx-4 overflow-x-auto px-4 lg:mx-0 lg:w-52 lg:shrink-0 lg:px-0'>
                    <ul className='flex gap-1 border-b lg:flex-col lg:border-b-0'>
                        {SETTINGS_NAV.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    end
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-fast',
                                            'border-b-2 px-3 py-2 lg:rounded-md lg:border-b-0',
                                            isActive
                                                ? 'border-primary text-foreground lg:bg-accent'
                                                : 'border-transparent text-muted-foreground hover:text-foreground lg:hover:bg-accent/60',
                                        )
                                    }
                                >
                                    <item.icon className='size-4' aria-hidden />
                                    {item.title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className='min-w-0 flex-1 space-y-6'>
                    <Outlet />
                </div>
            </div>
        </PageContainer>
    )
}

export default Settings
