"use client"

import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts"
import { FetchWrapper } from "@/lib/fetchWrapper.ts"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Button } from "@/components/ui/button.tsx"
import { TextInput } from "@/components/form/TextInput.tsx"
import { AvatarInput } from "@/components/form/AvatarInput.tsx"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { Loader2, Mail, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card.tsx"

interface EditUserDialogProps {
    onClose: () => void
    user: UserTypeSchema
}

const userEditSchema = z.object({
    email: z.string().email(),
    avatar: z.any().nullable(),
})

export type userData = {
    email: string
    avatar: File | null
}

function EditUserSheet({ onClose, user }: EditUserDialogProps) {
    const queryClient = useQueryClient()

    const form = useForm<userData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            email: user.email,
            avatar: null,
        },
    })

    const editUser = useMutation({
        mutationFn: async ({ email, avatar }: userData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl)
            await fetchWrapper.put(`/user/${user.userId}`, {
                email,
                avatar,
            })
        },
        onSuccess: () => {
            onClose()
            toast.success("User edited successfully!")
        },
        onError: (error) => {
            toast.error("Failed to edit user")
            console.error(error)
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ["users", "list"],
                })
            }, 500)
        },
    })

    const onSubmit: SubmitHandler<userData> = (data) => editUser.mutate(data)

    return (
        <Sheet
            open={true}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
        >
            <SheetContent className="sm:max-w-md">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-xl">Edit User</SheetTitle>
                        <SheetDescription>Make changes to the user's information.</SheetDescription>
                    </SheetHeader>

                    <Separator className='mt-3' />

                    <div className="py-6 space-y-6">
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                                    <User className="h-4 w-4" />
                                    <span>
                                      User ID: <span className="font-mono">{user.userId}</span>
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>Current Email: {user.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">User Information</h3>

                            <TextInput
                                name="email"
                                id="user-email-edit-form"
                                label="Email Address"
                                form={form}
                                placeholder="peter@mail.com"
                                type="email"
                            />

                            <div className="pt-2">
                                <AvatarInput
                                    name="avatar"
                                    id="user-avatar-edit-form"
                                    label="Profile Picture"
                                    form={form}
                                />
                            </div>
                        </div>

                        {editUser.error && (
                            <Alert variant="destructive" className="animate-in fade-in-50">
                                <AlertTitle className="flex items-center gap-2">
                                    <span className="i-lucide-alert-circle h-4 w-4" />
                                    Error updating user
                                </AlertTitle>
                                <AlertDescription className="mt-2">
                                    {editUser.error.message || "There was a problem updating this user. Please try again."}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Separator />

                    <SheetFooter className="pt-4 flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            type="button"
                            className="w-full sm:w-auto"
                            disabled={editUser.isPending}
                        >
                            Cancel
                        </Button>
                        <Button className="w-full sm:w-auto" type="submit" disabled={editUser.isPending}>
                            {editUser.isPending || form.formState.isDirty ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

export default EditUserSheet

