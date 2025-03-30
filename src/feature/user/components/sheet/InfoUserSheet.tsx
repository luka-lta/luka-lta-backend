import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import type { UserTypeSchema } from "../../schema/UserSchema.ts"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Button } from "@/components/ui/button.tsx"
import {cn, formatDate} from "@/lib/utils.ts"
import { CalendarDays, Mail, Shield, User } from "lucide-react"
import { Separator } from "@/components/ui/separator.tsx"
import {Badge} from "@/components/ui/badge.tsx";

interface InfoUserSheetProps {
    user: UserTypeSchema
    onClose: () => void
}

function InfoUserSheet({ user, onClose }: InfoUserSheetProps) {
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
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-xl">User Information</SheetTitle>
                    <SheetDescription>View detailed information about this user.</SheetDescription>
                </SheetHeader>

                <Separator />

                <div className="py-6 space-y-6">
                    {/* User Identity Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Identity
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-username-info-form">Username</Label>
                                <Input id="user-username-info-form" disabled value={user.username} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-id-info-form">User ID</Label>
                                <Input id="user-id-info-form" disabled value={user.userId} className="font-mono text-xs" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-email-info-form" className="flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </Label>
                            <Input id="user-email-info-form" disabled value={user.email} />
                        </div>
                    </div>

                    {/* User Status Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Status & Permissions
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-role-info-form">Role</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="user-role-info-form" disabled value={"User"} />
{/*
                                    {user.role === "admin" && <Badge variant="destructive">Admin</Badge>}
*/}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-status-info-form">Status</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="user-status-info-form" disabled value={"Active"} />
                                    <Badge variant={"default"} className={cn("ml-2 bg-red-500 text-white", user.isActive && "bg-green-500 text-black")}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Timestamps
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-created-info-form">Created</Label>
                                <Input id="user-created-info-form" disabled value={formatDate(user.createdAt)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-updated-info-form">Last Updated</Label>
                                <Input
                                    id="user-updated-info-form"
                                    disabled
                                    value={user.updatedAt ? formatDate(user.updatedAt) : "Never"}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user-last-active-info-form">Last Active</Label>
                                <Input
                                    id="user-last-active-info-form"
                                    disabled
                                    value={user.lastActive ? formatDate(user.lastActive.toString()) : "N/A"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <SheetFooter className="pt-4">
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default InfoUserSheet

