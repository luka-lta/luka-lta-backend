import { type FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { CopyButton } from "@/components/CopyButton.tsx";

/**
 * Platzhalter: Es gibt noch keinen Kürz-Endpunkt in der API. Die erzeugte
 * Adresse ist ein Beispiel und funktioniert nicht – die Card ist als Demo markiert.
 */
export function LinkShortener() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function shortenUrl(event: FormEvent) {
        event.preventDefault();
        setError("");
        setShortUrl("");

        try {
            new URL(url);
        } catch {
            setError("Bitte eine vollständige URL mit http:// oder https:// eingeben.");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        setShortUrl(`https://short.url/${Math.random().toString(36).substring(2, 8)}`);
        setIsLoading(false);
    }

    return (
        <form onSubmit={shortenUrl} className="space-y-4" noValidate>
            <div className="space-y-2">
                <Label htmlFor="shortener-url" className={error ? "text-destructive" : undefined}>Lange URL</Label>
                <div className="flex gap-2">
                    <Input
                        id="shortener-url"
                        type="url"
                        placeholder="https://…"
                        value={url}
                        aria-invalid={!!error}
                        aria-describedby={error ? "shortener-url-error" : undefined}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError("");
                        }}
                    />
                    <Button type="submit" disabled={isLoading || !url}>
                        {isLoading && <Loader2 className="animate-spin" />}
                        Kürzen
                    </Button>
                </div>
                {error && <p id="shortener-url-error" className="text-sm text-destructive">{error}</p>}
            </div>

            {shortUrl && (
                <div className="space-y-2">
                    <Label htmlFor="short-url">Beispiel-Ergebnis</Label>
                    <div className="flex items-center gap-2">
                        <Input id="short-url" value={shortUrl} readOnly className="font-mono text-xs" />
                        <CopyButton value={shortUrl} />
                    </div>
                </div>
            )}
        </form>
    );
}
