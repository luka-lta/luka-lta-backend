import { Pencil } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import type { UserTypeSchema } from "../../schema/UserSchema.ts"
import { formatDate } from "@/lib/utils.ts"
import RawJsonData from "@/components/raw-json-data.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { UserAvatar } from "@/components/data/user-avatar.tsx";
import { StatusBadge } from "@/components/feedback/status-badge.tsx";
import { useUsers } from "@/feature/user/context/users-context.tsx";

interface Props {
    currentRow: UserTypeSchema
    open: boolean
    onOpenChange: (open: boolean) => void
}

function InfoUserSheet({ currentRow, open, onOpenChange }: Props) {
    const { setOpen } = useUsers()

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <div className="flex items-center gap-3">
                        <UserAvatar name={currentRow.username} email={currentRow.email} avatarUrl={currentRow.avatarUrl} size="md" />
                        <div className="min-w-0">
                            <SheetTitle className="truncate">{currentRow.username}</SheetTitle>
                            <SheetDescription className="truncate">{currentRow.email}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <DetailList
                            items={[
                                { label: 'Status', value: <StatusBadge tone={currentRow.isActive ? 'success' : 'neutral'}>{currentRow.isActive ? 'Aktiv' : 'Inaktiv'}</StatusBadge> },
                                { label: 'Benutzer-ID', value: currentRow.userId, mono: true },
                                { label: 'Angelegt', value: formatDate(currentRow.createdAt) },
                                { label: 'Aktualisiert', value: currentRow.updatedAt ? formatDate(currentRow.updatedAt) : null },
                                { label: 'Zuletzt aktiv', value: currentRow.lastActive ? formatDate(currentRow.lastActive.toString()) : null },
                            ]}
                        />
                    </TabsContent>
                    <TabsContent value="json">
                        <RawJsonData jsonData={currentRow} />
                    </TabsContent>
                </Tabs>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
                    <Button onClick={() => setOpen('edit')}>
                        <Pencil />
                        Bearbeiten
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default InfoUserSheet
