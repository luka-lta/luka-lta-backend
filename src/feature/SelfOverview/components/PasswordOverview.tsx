import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { TextInput } from "@/components/form/TextInput.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { FetchWrapper } from "@/lib/fetchWrapper.ts";
import {Separator} from "@/components/ui/separator.tsx";

const passwordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string()
}).refine(data => data.password === data.repeatPassword, {
    message: "Passwords don't match",
    path: ["repeatPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

function PasswordOverview() {
    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: "onChange"
    });

    const updatePassword = useMutation({
        mutationFn: async ({ password }: PasswordFormData) => {
            const fetchWrapper = new FetchWrapper(FetchWrapper.baseUrl);
            await fetchWrapper.put("/auth/update-password", { password });
        },
        onSuccess: () => {
            toast.success("Password updated successfully", {
                description: "Your password has been changed",
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                action: {
                    label: "Dismiss",
                    onClick: () => {}
                }
            });
            form.reset();
        },
        onError: () => {
            toast.error("Failed to update password", {
                description: "Please try again later",
            });
        }
    });

    const onSubmit = (data: PasswordFormData) => {
        updatePassword.mutate(data);
    };

    return (
        <Card className="p-8 max-w-xl mx-auto">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Change Password</h2>
                    <p className="text-muted-foreground text-sm">
                        Create a new strong password to secure your account
                    </p>

                    <Separator className="mt-5" />
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TextInput
                        name="password"
                        id="new-password"
                        label="New Password"
                        form={form}
                        type="password"
                    />

                    <TextInput
                        name="repeatPassword"
                        id="repeat-password"
                        label="Confirm New Password"
                        form={form}
                        type="password"
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={!form.formState.isDirty}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            disabled={!form.formState.isValid || updatePassword.isPending}
                        >
                            {updatePassword.isPending ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
}

export default PasswordOverview;