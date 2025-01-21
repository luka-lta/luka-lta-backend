import {UserFormSchema, UserTypeSchema} from "@/shemas/UserSchema.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {splitAvatarUrl} from "@/lib/utils.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@radix-ui/react-select";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useAuthenticatedUserStore} from "@/stores/AuthUserStore.ts";

export function ProfileSettingsPage() {
    const { getUser } = useAuthenticatedUserStore();
    const user: UserTypeSchema | null = getUser();

    const form = useForm<UserTypeSchema>({
        resolver: zodResolver(UserFormSchema),
        defaultValues: {
            email: user?.email,
        },
    });

    if (!user) {
        return <p>No user found!</p>;
    }


    const onSubmit = async (data: UserTypeSchema) => {
        try {
            // Here you would typically send the data to your backend
            console.log('Form data submitted:', data);
            // Update the user state with the new data
            // You can add logic here to show a success message
        } catch (error) {
            console.error('Error submitting form:', error);
            // You can add logic here to show an error message
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-900 text-white">
            <aside className="w-1/5 p-4 bg-gray-800">
                <h2 className="text-xl font-bold">Settings</h2>
                <p className="text-sm text-gray-400">Manage your account settings and set e-mail preferences.</p>
                <nav className="mt-6 space-y-2">
                    <a href="#" className="block p-2 text-white bg-gray-700 rounded">
                        Profile
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Account
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Appearance
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Notifications
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Display
                    </a>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src={splitAvatarUrl(user.avatarUrl)} alt={user.email}/>
                                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" type="button">Change Avatar</Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input id="userId" value={user.userId} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                {...form.register('email')}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <Separator />
                        {/*                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            {...form.register('password')}
                        />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>*/}
                        <Separator />
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Account created: {new Date(user.createdAt).toLocaleString()}</p>
                            {user.updatedAt && (
                                <p className="text-sm text-muted-foreground">Last updated: {new Date(user.updatedAt).toLocaleString()}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                </Card>
            </form>


        </main>
        </div>
    )
}