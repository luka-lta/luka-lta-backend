import { useState } from "react"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Copy, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"

export function LinkShortener() {
    const [url, setUrl] = useState("")
    const [shortUrl, setShortUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    const shortenUrl = async () => {
        // Reset states
        setError("")
        setShortUrl("")
        setCopied(false)

        // Validate URL
        if (!url) {
            setError("Please enter a URL")
            return
        }

        try {
            // URL validation
            new URL(url)
        } catch (e) {
            setError("Please enter a valid URL including http:// or https://")
            console.log(e)
            return
        }

        setIsLoading(true)

        try {
            // Simulate API call to shorten URL
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Generate a random short code
            const shortCode = Math.random().toString(36).substring(2, 8)
            setShortUrl(`https://short.url/${shortCode}`)
        } catch (error) {
            console.log(error)
            setError("Failed to shorten URL. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.log(error)
            setError("Failed to copy to clipboard")
        }
    }

    const handleReset = () => {
        setUrl("")
        setShortUrl("")
        setError("")
        setCopied(false)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="url">Enter a long URL</Label>
                <div className="flex gap-2">
                    <Input
                        id="url"
                        placeholder="https://example.com/very/long/url/that/needs/shortening"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <Button onClick={handleReset} variant="outline" size="icon" disabled={isLoading || !url}>
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Button onClick={shortenUrl} className="w-full" disabled={isLoading || !url}>
                {isLoading ? (
                    <>
                        Shortening...
                    </>
                ) : (
                    "Shorten URL"
                )}
            </Button>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {shortUrl && (
                <div className="space-y-2 pt-2">
                    <Label htmlFor="short-url">Your shortened URL</Label>
                    <div className="flex gap-2">
                        <Input id="short-url" value={shortUrl} readOnly className="font-medium" />
                        <Button onClick={copyToClipboard} variant="secondary" size="icon">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    {copied && <p className="text-sm text-green-600 dark:text-green-400">Copied to clipboard!</p>}
                </div>
            )}
        </div>
    )
}

