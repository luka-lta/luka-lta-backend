import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, Newspaper} from "lucide-react"
import {LinkShortener} from "@/components/dashboard/tools/LinkShortener.tsx";
import {PaywallBlocker} from "@/components/dashboard/tools/PaywallBlocker.tsx";

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState("link-shortener")

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-2">Tools</h1>

            <Tabs defaultValue="link-shortener" value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
                <TabsList className="grid grid-cols-2 md:grid-cols-2 mb-8">
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
        </div>
    )
}

