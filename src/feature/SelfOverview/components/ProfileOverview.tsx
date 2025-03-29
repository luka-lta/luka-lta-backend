import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { splitAvatarUrl } from "@/lib/utils.ts";
import { TextInput } from "@/components/form/TextInput.tsx";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserTypeSchema } from "@/feature/user/schema/UserSchema.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FetchWrapper } from "@/lib/fetchWrapper.ts";
import { toast } from "sonner";
import { Pencil, Upload } from "lucide-react";

const userUpdateSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    avatarUrl: z.string().optional(),
});

interface userUpdateData {
    username: string;
    email: string;
    avatarUrl?: string;
}

interface ProfileOverviewProps {
    user: UserTypeSchema | undefined;
}

function ProfileOverview({ user }: ProfileOverviewProps) {
    const queryClient = useQueryClient();

    const form = useForm<userUpdateData>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            email: user?.email,
            avatarUrl: user?.avatarUrl ?? '',
        }
    });

    const updateSelf = useMutation({
        mutationFn: async ({ email, avatarUrl, username }: userUpdateData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put(`/self/`, {
                userId: user?.userId,
                username,
                email,
                avatarUrl,
            });
        },
        onSuccess: () => {
            toast.success('Profile updated successfully!', {
                description: 'Your changes have been saved',
            });
        },
        onError: (error) => {
            toast.error('Failed to update profile', {
                description: 'Please try again later',
            });
            console.error(error);
        },
        onSettled: () => {
            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['self', 'user'],
                });
            }, 500);
        }
    });

    const onSubmit: SubmitHandler<userUpdateData> = (data) => updateSelf.mutate(data);

    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-8 md:flex-row">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 rounded-lg border-2 border-muted">
                            <AvatarImage src={splitAvatarUrl(user?.avatarUrl)} alt="User avatar" />
                            <AvatarFallback className="rounded-lg text-2xl font-medium">
                                {user?.email?.charAt(0).toUpperCase() ?? '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                            <Pencil className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Change Avatar
                    </Button>
                </div>

                {/* Form Section */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Profile Information</h2>
                        <p className="text-muted-foreground text-sm">
                            Update your account details
                        </p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <TextInput
                            name="username"
                            id="username-self-overview-update"
                            label="Username"
                            form={form}
                            type="text"
                        />

                        <TextInput
                            name="email"
                            id="email-self-overview-update"
                            label="Email Address"
                            form={form}
                            type="email"
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => form.reset()}
                                disabled={!form.formState.isDirty}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!form.formState.isDirty || updateSelf.isPending}
                            >
                                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Card>
    );
}

export default ProfileOverview;