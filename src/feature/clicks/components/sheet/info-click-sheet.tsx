import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Button } from "@/components/ui/button.tsx"
import {formatDate} from "@/lib/utils.ts"
import {CalendarDays, Shield, LucideTextCursor, Monitor, Smartphone, Tablet} from "lucide-react"
import { Separator } from "@/components/ui/separator.tsx"
import {clickTypeSchema} from "@/feature/clicks/schema/clickSchema.ts";
import Flag from "react-flagkit";
import {UserAgentInfo} from "@/components/user-agent-icon.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";

interface Props {
    currentRow: clickTypeSchema
    open: boolean
    onOpenChange: (open: boolean) => void
}

function InfoClicksSheet({ currentRow, open, onOpenChange }: Props) {
    return (
        <Sheet
            open={open}
            onOpenChange={(state) => {
                onOpenChange(state)
            }}
        >
            <SheetContent className="sm:max-w-md">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-xl">Clicks Information</SheetTitle>
                    <SheetDescription>View detailed information about this Clicks.</SheetDescription>
                </SheetHeader>

                <Separator />

                <div className="py-6 space-y-6">
                    {/* Clicks Identity Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                            <LucideTextCursor className="mr-2 h-4 w-4" />
                            Identity
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="Clicks-Clicksname-info-form">Click ID</Label>
                                <Input id="Clicks-Clicksname-info-form" disabled value={currentRow.clickId} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-id-info-form">Click Tag</Label>
                                <Input id="Clicks-id-info-form" disabled value={currentRow.clickTag} className="font-mono text-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Meta Data Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            Meta data
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="Clicks-role-info-form">URL</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="user-role-info-form" disabled value={currentRow.url} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">IP Address</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.ipAddress || '-'} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">Market</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.market || '-'} />
                                    <Flag country={currentRow.market || ''} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">User Agent</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.userAgent || '-'} />
                                    <UserAgentInfo userAgent={currentRow.userAgent || ''} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">Operation System</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.os || '-'} />
                                    <OperatingSystem os={currentRow.os || ''}/>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">Device</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.device || '-'} />
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        {currentRow.device === "Desktop" && <Monitor className="w-4 h-4"/>}
                                        {currentRow.device === "Mobile" && <Smartphone className="w-4 h-4"/>}
                                        {currentRow.device === "Tablet" && <Tablet className="w-4 h-4"/>}
                                        {currentRow.device || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="Clicks-status-info-form">Referrer</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="Clicks-status-info-form" disabled value={currentRow.referer || '-'} />
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
                                <Label htmlFor="Clicks-created-info-form">Clicked at</Label>
                                <Input id="Clicks-created-info-form" disabled value={formatDate(currentRow.clickedAt)} />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <SheetFooter className="pt-4">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Close
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default InfoClicksSheet

