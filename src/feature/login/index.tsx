import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import AuthLayout from "@/feature/login/auth-layout.tsx";
import {UserAuthForm} from "@/feature/login/components/LoginForm.tsx";

function Login() {
    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>Login</CardTitle>
                    <CardDescription>
                        Enter your email and password below to <br />
                        log into your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UserAuthForm />
                </CardContent>
                <CardFooter>
                    <p className='text-muted-foreground px-8 text-center text-sm'>
                        By clicking login, you agree to our{' '}
                        <a
                            href='/terms'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href='/privacy'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}

export default Login;