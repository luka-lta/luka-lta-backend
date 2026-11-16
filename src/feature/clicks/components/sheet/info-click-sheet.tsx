import Flag from "react-flagkit";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { formatAbsFull } from "@/lib/dateTimeUtils.ts";
import { clickTypeSchema } from "@/feature/clicks/schema/clickSchema.ts";
import { UserAgentInfo } from "@/components/user-agent-icon.tsx";
import { OperatingSystem } from "@/components/operating-system.tsx";
import RawJsonData from "@/components/raw-json-data.tsx";
import { DetailList } from "@/components/data/detail-list.tsx";
import { DeviceLabel } from "@/feature/clicks/components/DeviceLabel.tsx";

interface Props {
    currentRow: clickTypeSchema
    open: boolean
    onOpenChange: (open: boolean) => void
}

function InfoClicksSheet({ currentRow, open, onOpenChange }: Props) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Klick #{currentRow.clickId}</SheetTitle>
                    <SheetDescription>{formatAbsFull(currentRow.clickedAt)}</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <DetailList
                            items={[
                                { label: 'Ziel', value: <a href={currentRow.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{currentRow.url}</a> },
                                { label: 'Tag', value: currentRow.clickTag, mono: true },
                                { label: 'Land', value: currentRow.market ? <span className="inline-flex items-center gap-1.5"><Flag country={currentRow.market} size={16} />{currentRow.market}</span> : null },
                                { label: 'Gerät', value: <DeviceLabel device={currentRow.device} /> },
                                { label: 'System', value: currentRow.os ? <span className="inline-flex items-center gap-1.5"><OperatingSystem os={currentRow.os} />{currentRow.os}</span> : null },
                                { label: 'Browser', value: currentRow.userAgent ? <UserAgentInfo userAgent={currentRow.userAgent} /> : null },
                                { label: 'Referrer', value: currentRow.referer },
                                { label: 'IP-Adresse', value: currentRow.ipAddress, mono: true },
                                { label: 'User-Agent', value: currentRow.userAgent, mono: true },
                            ]}
                        />
                    </TabsContent>
                    <TabsContent value="json">
                        <RawJsonData jsonData={currentRow} />
                    </TabsContent>
                </Tabs>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default InfoClicksSheet
