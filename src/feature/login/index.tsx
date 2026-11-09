import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import AuthLayout from '@/feature/login/auth-layout.tsx'
import { UserAuthForm } from '@/feature/login/components/LoginForm.tsx'

function Login() {
    useEffect(() => {
        document.title = 'Anmelden · Luka Dev Admin'
    }, [])

    return (
        <AuthLayout>
            <Card>
                <CardHeader>
                    <h1 className='text-lg font-semibold leading-snug tracking-tight'>Anmelden</h1>
                    <CardDescription>Melde dich mit E-Mail und Passwort an.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserAuthForm />
                </CardContent>
            </Card>
        </AuthLayout>
    )
}

export default Login
