import {useState} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Link, Newspaper} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {LinkShortener} from "@/feature/tools/components/LinkShortener.tsx";
import {PaywallBlocker} from "@/feature/tools/components/PaywallBlocker.tsx";
import {Main} from "@/components/layout/main.tsx";

function Tools() {
    const [activeTab, setActiveTab] = useState("link-shortener")

    return (
        <Main>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
                <p className="text-muted-foreground">Utilities for links and content.</p>
            </div>

            <Tabs defaultValue="link-shortener" value={activeTab} onValueChange={setActiveTab} className="max-w-3xl">
                <TabsList className="mb-8">
                    <TabsTrigger value="link-shortener" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        <span className="hidden md:inline">Link Shortener</span>
                    </TabsTrigger>
                    <TabsTrigger value="paywall-blocker" className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4" />
                        <span className="hidden md:inline">Paywall Blocker</span>
                    </TabsTrigger>
                </TabsList>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab === "link-shortener" && "Link Shortener"}
                            {activeTab === "paywall-blocker" && "Paywall Blocker"}
                        </CardTitle>
                        <CardDescription>
                            {activeTab === "link-shortener" && "Shorten long URLs into compact, shareable links"}
                            {activeTab === "paywall-blocker" && "Access content behind paywalls on news sites"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="link-shortener" className="mt-0">
                            <LinkShortener />
                        </TabsContent>
                        <TabsContent value="paywall-blocker" className="mt-0">
                            <PaywallBlocker />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </Main>
    )
}

export default Tools;