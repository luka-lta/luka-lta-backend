import { Expand } from "lucide-react";
import { useState } from "react";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Button} from "@/components/ui/button.tsx";
import StandardSection from "@/components/standard-section.tsx";
import {Browser} from "@/components/browser.tsx";
import {DeviceIcon} from "@/components/device-icon.tsx";
import {OperatingSystem} from "@/components/operating-system.tsx";

interface DevicesProps {
    className?: string;
}

type Tab = "devices" | "browsers" | "os" | "dimensions" | "browser_versions" | "os_versions";

export function Devices({className}: DevicesProps) {
    const [tab, setTab] = useState<Tab>("browsers");
    const [expanded, setExpanded] = useState(false);
    const close = () => {
        setExpanded(false);
    };

    return (
        <Card className={className}>
            <CardContent className="mt-2">
                <Tabs defaultValue="browsers" value={tab} onValueChange={value => setTab(value as Tab)}>
                    <div className="flex flex-row gap-2 justify-between items-center">
                        <div className="overflow-x-auto">
                            <TabsList>
                                <TabsTrigger value="browsers">Browsers</TabsTrigger>
                                <TabsTrigger value="devices">Devices</TabsTrigger>
                                <TabsTrigger value="os">Operating Systems</TabsTrigger>
                                <TabsTrigger value="dimensions">Screen Dimensions</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="w-7">
                            <Button size="sm" onClick={() => setExpanded(!expanded)}>
                                <Expand className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="devices">
                        <StandardSection
                            filterParameter="device_type"
                            title="Devices"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => (
                                <div className="flex gap-2 items-center">
                                    <DeviceIcon deviceType={e.value || ""} size={16} />
                                    {e.value || "Other"}
                                </div>
                            )}
                            expanded={expanded}
                            close={close}
                        />
                    </TabsContent>
                    <TabsContent value="browsers">
                        <StandardSection
                            filterParameter="browser"
                            title="Browsers"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => (
                                <div className="flex gap-2 items-center">
                                    <Browser browser={e.value} />
                                    {e.value || "Other"}
                                </div>
                            )}
                            getSubrowLabel={e => {
                                const justBrowser = e.value.split(" ").slice(0, -1).join(" ");
                                return (
                                    <div className="flex gap-2 items-center">
                                        <Browser browser={justBrowser || "Other"} />
                                        {e.value || "Other"}
                                    </div>
                                );
                            }}
                            expanded={expanded}
                            close={close}
                            hasSubrow={true}
                        />
                    </TabsContent>
                    <TabsContent value="os">
                        <StandardSection
                            title="Operating Systems"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => (
                                <div className="flex gap-2 items-center">
                                    <OperatingSystem os={e.value || "Other"} />
                                    {e.value || "Other"}
                                </div>
                            )}
/*                            getSubrowLabel={e => {
                                const justOS = e.value.split(" ").slice(0, -1).join(" ");
                                return (
                                    <div className="flex gap-2 items-center">
                                        <OperatingSystem os={justOS || "Other"} />
                                        {e.value || "Other"}
                                    </div>
                                );
                            }}*/
                            filterParameter="os"
                            expanded={expanded}
                            close={close}
/*
                            hasSubrow={true}
*/
                        />
                    </TabsContent>
                    <TabsContent value="dimensions">
                        <StandardSection
                            title="Screen Dimensions"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => <div className="flex gap-2 items-center">{e.value || "Other"}</div>}
                            filterParameter="dimensions"
                            expanded={expanded}
                            close={close}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
