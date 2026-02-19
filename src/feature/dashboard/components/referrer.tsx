import {Card, CardContent} from "@/components/ui/card.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useState} from "react";
import StandardSection from "@/components/standard-section.tsx";
import {Favicon} from "@/components/Favicon.tsx";
import {ChannelIcon} from "@/components/channel.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Expand} from "lucide-react";

function Referrer() {
    const [tab, setTab] = useState("referrers");
    const [expanded, setExpanded] = useState(false);
    const close = () => {
        setExpanded(false);
    };

    return (
        <Card className="">
            <CardContent className="mt-2">
                <Tabs defaultValue="referrers" value={tab} onValueChange={value => setTab(value)}>
                    <div className="flex flex-row gap-2 justify-between items-center">
                        <div className="overflow-x-auto">
                            <TabsList>
                                <TabsTrigger value="referrers">Referrers</TabsTrigger>
                                <TabsTrigger value="channels">Channels</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="w-7">
                            <Button size="sm" onClick={() => setExpanded(!expanded)}>
                                <Expand className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="referrers">
                        <StandardSection
                            filterParameter="referrer"
                            title="Referrers"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLink={e => `https://${e.value}`}
                            getLabel={e => (
                                <div className="flex items-center">
                                    <Favicon domain={e.value} className="w-4 mr-2" />
                                    {e.value ? e.value : "Direct"}
                                </div>
                            )}
                            expanded={expanded}
                            close={close}
                        />
                    </TabsContent>
                    <TabsContent value="channels">
                        <StandardSection
                            filterParameter="channel"
                            title="Channels"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            // getLink={(e) => `https://${e.value}`}
                            getLabel={e => (
                                <div className="flex items-center gap-2">
                                    <ChannelIcon channel={e.value} /> {e.value}
                                </div>
                            )}
                            expanded={expanded}
                            close={close}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default Referrer
