import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/form/TextInput.tsx'
import { useUpdateSelfPassword } from '@/api/self/hooks.ts'
import { getApiErrorMessage } from '@/lib/apiError'

const passwordSchema = z
    .object({
        password: z.string().min(8, 'Mindestens 8 Zeichen'),
        repeatPassword: z.string(),
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: 'Die Passwörter stimmen nicht überein',
        path: ['repeatPassword'],
    })

type PasswordFormData = z.infer<typeof passwordSchema>

/** Formular zum Ändern des eigenen Passworts. */
function PasswordOverview() {
    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: 'onChange',
        defaultValues: { password: '', repeatPassword: '' },
    })

    const updatePassword = useUpdateSelfPassword()

    const onSubmit = (data: PasswordFormData) => {
        updatePassword.mutate(data.password, {
            onSuccess: () => {
                toast.success('Passwort geändert')
                form.reset()
            },
            onError: (error) => {
                toast.error(getApiErrorMessage(error))
            },
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='max-w-form space-y-5'>
            <TextInput
                name='password'
                id='new-password'
                label='Neues Passwort'
                form={form}
                type='password'
                autoComplete='new-password'
                description='Mindestens 8 Zeichen.'
            />
            <TextInput
                name='repeatPassword'
                id='repeat-password'
                label='Passwort wiederholen'
                form={form}
                type='password'
                autoComplete='new-password'
            />
            <div className='flex justify-end gap-2'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => form.reset()}
                    disabled={!form.formState.isDirty || updatePassword.isPending}
                >
                    Verwerfen
                </Button>
                <Button type='submit' disabled={!form.formState.isValid || updatePassword.isPending}>
                    {updatePassword.isPending && <Loader2 className='animate-spin' aria-hidden='true' />}
                    Passwort ändern
                </Button>
            </div>
        </form>
    )
}

export default PasswordOverview
