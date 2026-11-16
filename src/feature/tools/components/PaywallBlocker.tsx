import { type FormEvent, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";

const SERVICE = "https://www.removepaywall.com/search?url=";
const BOOKMARKLET = `javascript:(function(){window.location.href='${SERVICE}'+window.location.href})();`;

export function PaywallBlocker() {
    const [url, setUrl] = useState("");
    const [bypassUrl, setBypassUrl] = useState("");
    const [error, setError] = useState("");

    function bypassPaywall(event: FormEvent) {
        event.preventDefault();
        setError("");
        setBypassUrl("");

        try {
            const parsedUrl = new URL(url);
            setBypassUrl(`${SERVICE}${parsedUrl}`);
        } catch {
            setError("Bitte eine vollständige URL mit http:// oder https:// eingeben.");
        }
    }

    return (
        <Tabs defaultValue="url" className="space-y-4">
            <TabsList>
                <TabsTrigger value="url">Per URL</TabsTrigger>
                <TabsTrigger value="bookmarklet">Lesezeichen</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-0">
                <form onSubmit={bypassPaywall} className="space-y-4" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="paywall-url" className={error ? "text-destructive" : undefined}>Artikel-URL</Label>
                        <div className="flex gap-2">
                            <Input
                                id="paywall-url"
                                type="url"
                                placeholder="https://…"
                                value={url}
                                aria-invalid={!!error}
                                aria-describedby={error ? "paywall-url-error" : undefined}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError("");
                                }}
                            />
                            <Button type="submit" disabled={!url}>Umgehen</Button>
                        </div>
                        {error && <p id="paywall-url-error" className="text-sm text-destructive">{error}</p>}
                    </div>

                    {bypassUrl && (
                        <div className="space-y-2">
                            <Label htmlFor="bypass-url">Freier Link</Label>
                            <div className="flex items-center gap-2">
                                <Input id="bypass-url" value={bypassUrl} readOnly className="font-mono text-xs" />
                                <CopyButton value={bypassUrl} />
                                <Button variant="outline" size="icon" asChild>
                                    <a href={bypassUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink />
                                        <span className="sr-only">In neuem Tab öffnen</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </form>
            </TabsContent>

            <TabsContent value="bookmarklet" className="mt-0 space-y-4">
                <ol className="list-inside list-decimal space-y-1.5 text-sm text-muted-foreground">
                    <li>Code unten kopieren.</li>
                    <li>Neues Lesezeichen anlegen und den Code als URL einfügen.</li>
                    <li>Auf einem Artikel mit Paywall das Lesezeichen anklicken.</li>
                </ol>
                <div className="space-y-2">
                    <Label htmlFor="bookmarklet-code">Lesezeichen-Code</Label>
                    <div className="flex items-center gap-2">
                        <Input id="bookmarklet-code" value={BOOKMARKLET} readOnly className="font-mono text-xs" />
                        <CopyButton value={BOOKMARKLET} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
