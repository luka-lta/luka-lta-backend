"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PaywallBlocker() {
    const [url, setUrl] = useState("")
    const [bypassUrl, setBypassUrl] = useState("")
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")

    const bypassPaywall = () => {
        setError("")
        setBypassUrl("")
        setCopied(false)

        if (!url) {
            setError("Please enter a URL")
            return
        }

        try {
            const parsedUrl = new URL(url)
            setBypassUrl(`https://www.removepaywall.com/search?url=${parsedUrl}`)
        } catch (e) {
            setError("Please enter a valid URL including http:// or https://")
            console.log(e)
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.log(error)
            setError("Failed to copy to clipboard")
        }
    }

    const bookmarkletCode = `javascript:(function(){window.location.href='https://www.removepaywall.com/search?url='+window.location.href})();`

    return (
        <div className="space-y-6">
            <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="url">URL Method</TabsTrigger>
                    <TabsTrigger value="bookmarklet">Bookmarklet</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="paywall-url">Enter a paywalled article URL</Label>
                        <Input
                            id="paywall-url"
                            placeholder="https://example.com/paywalled-article"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <Button onClick={bypassPaywall} className="w-full" disabled={!url}>
                        Bypass Paywall
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {bypassUrl && (
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="bypass-url">Bypassed URL</Label>
                            <div className="flex gap-2">
                                <Input id="bypass-url" value={bypassUrl} readOnly className="font-medium" />
                                <Button onClick={() => copyToClipboard(bypassUrl)} variant="secondary" size="icon">
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => window.open(bypassUrl, "_blank")} variant="outline" size="icon">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                            {copied && <p className="text-sm text-green-600 dark:text-green-400">Copied to clipboard!</p>}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="bookmarklet" className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Drag the button below to your bookmarks bar. When you're on a paywalled site, click the bookmark to bypass
                            it.
                        </AlertDescription>
                    </Alert>

                    <div className="flex justify-center py-4">
                        <Button variant="outline" className="cursor-grab" draggable onClick={(e) => e.preventDefault()}>
                            🔓 Bypass Paywall
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-medium mb-2">Instructions:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>Drag the button above to your bookmarks bar</li>
                                <li>Navigate to a paywalled article</li>
                                <li>Click the "Bypass Paywall" bookmark</li>
                                <li>Wait for the archive.is version to load</li>
                            </ol>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Label htmlFor="bookmarklet-code">Bookmarklet Code</Label>
                        <div className="flex gap-2">
                            <Input id="bookmarklet-code" value={bookmarkletCode} readOnly className="font-mono text-xs" />
                            <Button onClick={() => copyToClipboard(bookmarkletCode)} variant="secondary" size="icon">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        {copied && <p className="text-sm text-green-600 dark:text-green-400">Copied to clipboard!</p>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

