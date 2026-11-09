import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { FileQuestion, TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AuthLayout from '@/feature/login/auth-layout.tsx'
import { useAuthenticatedUserStore } from '@/store/authStore.ts'

/** Fehlerseite außerhalb des Dashboards: unbekannte Route oder Render-Fehler. */
function ErrorPage() {
    const error = useRouteError()
    const isAuthenticated = useAuthenticatedUserStore((s) => s.isAuthenticated)()
    const notFound = isRouteErrorResponse(error) && error.status === 404
    const Icon = notFound ? FileQuestion : TriangleAlert
    const title = notFound ? 'Seite nicht gefunden' : 'Etwas ist schiefgelaufen'

    useEffect(() => {
        document.title = `${title} · Luka Dev Admin`
    }, [title])

    return (
        <AuthLayout>
            <div className='flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-10 text-center shadow-xs'>
                <div className='flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    <Icon className='size-6' aria-hidden='true' />
                </div>
                <div className='space-y-1'>
                    {notFound && <p className='font-mono text-sm text-muted-foreground'>404</p>}
                    <h1 className='text-xl font-semibold'>{title}</h1>
                    <p className='text-sm text-muted-foreground'>
                        {notFound
                            ? 'Die Adresse gibt es nicht oder sie wurde verschoben.'
                            : 'Die Seite konnte nicht geladen werden. Lade sie neu oder geh zurück.'}
                    </p>
                </div>
                <div className='flex flex-col gap-2 sm:flex-row'>
                    {isAuthenticated ? (
                        <Button asChild>
                            <Link to='/dashboard'>Zum Dashboard</Link>
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link to='/'>Zur Anmeldung</Link>
                        </Button>
                    )}
                    {!notFound && (
                        <Button variant='outline' onClick={() => window.location.reload()}>
                            Neu laden
                        </Button>
                    )}
                </div>
            </div>
        </AuthLayout>
    )
}

export default ErrorPage
