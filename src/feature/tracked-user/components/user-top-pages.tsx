import {useState} from "react";
import {useGetSite} from "@/api/analytics/hooks/useSites.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import StandardSection from "@/components/standard-section.tsx";
import {truncateString} from "@/api/utils.ts";

type Tab = "pages" | "events";

export function UserTopPages({ userId }: { userId: string }) {
    const [tab, setTab] = useState<Tab>("pages");

    const { data: siteMetadata } = useGetSite();

    return (
        <Card>
            <CardContent className="mt-2">
                <Tabs defaultValue="pages" value={tab} onValueChange={value => setTab(value as Tab)}>
                    <div className="flex flex-row gap-2 items-center">
                        <TabsList>
                            <TabsTrigger value="pages">Top Pages</TabsTrigger>
                        </TabsList>
                        {/* <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList> */}
                    </div>
                    <TabsContent value="pages">
                        <StandardSection
                            filterParameter="pathname"
                            title="Pages"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => truncateString(e.value, 50) || "Other"}
                            getLink={e => `https://${siteMetadata?.domain}${e.value}`}
                            expanded={false}
                            close={close}
                            customFilters={[{ parameter: "user_id", value: [userId], type: "equals" }]}
                        />
                    </TabsContent>
                    <TabsContent value="events">
                        <StandardSection
                            filterParameter="pathname"
                            title="Pages"
                            getValue={e => e.value}
                            getKey={e => e.value}
                            getLabel={e => truncateString(e.value, 50) || "Other"}
                            getLink={e => `https://${siteMetadata?.domain}${e.value}`}
                            expanded={false}
                            close={close}
                            customFilters={[{ parameter: "user_id", value: [userId], type: "equals" }]}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}